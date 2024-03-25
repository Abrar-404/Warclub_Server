// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const cookieParser = require('cookie-parser');
// const app = express();
// const port = process.env.PORT || 5000;

// // middleware
// app.use(
//   cors({
//     origin: [
//       'http://localhost:5173',
//       'http://localhost:5000',
//       'https://warclub-27642.web.app',
//       'https://server-pi-opal-58.vercel.app',
//     ],
//     credentials: true,
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//     optionsSuccessStatus: 204,
//     exposedHeaders: ['Access-Control-Allow-Headers'],
//   })
// );
// app.use(express.json());
// app.use(cookieParser());

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eted0lc.mongodb.net/?retryWrites=true&w=majority`;

// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

// async function run() {
//   try {

//     const allGamesCollection = client.db('gamesCollection').collection('games');
//     const timerGameCollection = client.db('gamesCollection').collection('timerGame');

//     app.get('/games', async (req, res) => {
//       const result = await allGamesCollection.find().toArray();
//       res.send(result);
//     });

//     await client.db('admin').command({ ping: 1 });
//     console.log(
//       'Pinged your deployment. You successfully connected to MongoDB!'
//     );
//   } finally {
//   }
// }
// run().catch(console.dir);

// app.get('/', (req, res) => {
//   res.send('Gaming is on');
// });

// app.listen(port, () => {
//   console.log(`Port is running on: ${port}`);
// });





const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 5000;

// Middleware
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

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eted0lc.mongodb.net/?retryWrites=true&w=majority`;

// Connect to MongoDB
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const allGamesCollection = client.db('gamesCollection').collection('games');
    const timerGameCollection = client
      .db('gamesCollection')
      .collection('timerGame');

    // Function to fetch and delete a single document from timerGameCollection
    async function fetchAndDeleteGameData() {
      const gameData = await timerGameCollection.findOneAndDelete({});
      return gameData.value;
    }

    // Function to start the timer and add new data to UI
    function startTimer() {
      setInterval(async () => {
        const newGameData = await fetchAndDeleteGameData();
        if (newGameData) {
          // Emit new game data to clients
          io.emit('newGameData', newGameData);
          console.log('New game data added:', newGameData);
        }
      }, 5000); // Adjust the interval as needed
    }

    // Start the timer
    startTimer();

    app.get('/games', async (req, res) => {
      const result = await allGamesCollection.find().toArray();
      res.send(result);
    });

    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
  }
}
run().catch(console.dir);

// Root endpoint
app.get('/', (req, res) => {
  res.send('Gaming is on');
});

// Start listening on the specified port
app.listen(port, () => {
  console.log(`Port is running on: ${port}`);
});

