const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cookieParser = require('cookie-parser');

const app = express();
const port = process.env.PORT || 5001;

// Prevent process from crashing on unhandled errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Middleware
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5000',
      'http://localhost:5001',
      'http://127.0.0.1:5000',
      'http://127.0.0.1:5001',
      'https://warclub-27642.web.app',
      'https://warclub-27642.firebaseapp.com',
      'https://server-sigma-ten-76.vercel.app',
      'https://server-pi-opal-58.vercel.app',
    ],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    optionsSuccessStatus: 204,
    exposedHeaders: ['Access-Control-Allow-Headers'],
  })
);
app.use(express.json());
app.use(cookieParser());

// MongoDB Client setup with timeout and pool options
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eted0lc.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  maxPoolSize: 10,
});

const jwt = require('jsonwebtoken');

const db = client.db('gamesCollection');
const allGamesCollection = db.collection('games');
const newGamesCollection = db.collection('addNewGame');
const timerGameCollection = db.collection('timerGame');
const blogsCollection = db.collection('blogs');
const usersCollection = db.collection('users');

let isConnected = false;

async function connectDB(retries = 5, delayMs = 3000) {
  for (let i = 1; i <= retries; i++) {
    try {
      await client.connect();
      await client.db('admin').command({ ping: 1 });
      isConnected = true;
      console.log('Pinged your deployment. You successfully connected to MongoDB!');
      return;
    } catch (error) {
      isConnected = false;
      console.error(`MongoDB connection attempt ${i} failed:`, error.message);
      if (i < retries) {
        console.log(`Retrying MongoDB connection in ${delayMs / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  console.error('All initial MongoDB connection attempts failed. Server will continue running and retry on requests.');
}

connectDB();

// Routes
app.get('/', (req, res) => {
  res.send('Gaming is on');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', mongoConnected: isConnected, port });
});

// Authentication & Users
app.post('/jwt', async (req, res) => {
  try {
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET || 'secret', {
      expiresIn: '7d',
    });
    res
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      })
      .send({ success: true, token });
  } catch (error) {
    console.error('Error generating JWT:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

app.post('/logout', async (req, res) => {
  try {
    res.clearCookie('token', { maxAge: 0 }).send({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

app.post('/users', async (req, res) => {
  try {
    const user = req.body;
    if (!user || !user.email) {
      return res.status(400).json({ message: 'User email is required' });
    }
    const query = { email: user.email };
    const existingUser = await usersCollection.findOne(query);
    if (existingUser) {
      return res.send({ message: 'User already exists', insertedId: null });
    }
    const result = await usersCollection.insertOne(user);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ error: 'Failed to save user' });
  }
});

app.get('/users', async (req, res) => {
  try {
    const result = await usersCollection.find().toArray();
    res.send(result);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/games', async (req, res) => {
  try {
    const result = await allGamesCollection.find().toArray();
    res.send(result);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

app.get('/timerGame', async (req, res) => {
  try {
    const result = await timerGameCollection.findOne();
    res.send(result);
  } catch (error) {
    console.error('Error fetching timerGame:', error);
    res.status(500).json({ error: 'Failed to fetch timer game' });
  }
});

app.get('/blogs', async (req, res) => {
  try {
    const result = await blogsCollection.find().toArray();
    res.send(result);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

app.post('/addGame', async (req, res) => {
  try {
    const { img, name, review, fee } = req.body;
    const newGame = { img, name, review, fee };
    const result = await newGamesCollection.insertOne(newGame);
    res.status(201).json({
      message: 'Game added successfully',
      gameId: result.insertedId,
    });
  } catch (error) {
    console.error('Error adding new game:', error);
    res.status(500).json({ message: 'Failed to add new game' });
  }
});

const server = app.listen(port, () => {
  console.log(`Port is running on: ${port}`);
});

server.on('error', (err) => {
  console.error('Server listener error:', err);
});

