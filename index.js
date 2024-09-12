const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5000',
      'https://warclub-27642.web.app',
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

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eted0lc.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const allGamesCollection = client.db('gamesCollection').collection('games');

    const newGamesCollection = client
      .db('gamesCollection')
      .collection('addNewGame');

    const timerGameCollection = client
      .db('gamesCollection')
      .collection('timerGame');

    const blogsCollection = client.db('gamesCollection').collection('blogs');

    app.get('/games', async (req, res) => {
      const result = await allGamesCollection.find().toArray();
      res.send(result);
    });

    app.get('/timerGame', async (req, res) => {
      const result = await timerGameCollection.findOne();
      res.send(result);
    });

    app.get('/blogs', async (req, res) => {
      const result = await blogsCollection.find().toArray();
      res.send(result);
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

    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Gaming is on');
});

app.listen(port, () => {
  console.log(`Port is running on: ${port}`);
});
