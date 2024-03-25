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
const socketIo = require('socket.io');
const io = socketIo(server);
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
    await client.connect();

    const allGamesCollection = client.db('gamesCollection').collection('games');
    const timerGameCollection = client
      .db('gamesCollection')
      .collection('timerGame');

    // Function to add data from MongoDB to UI
    async function addDataToUI() {
      const data = await timerGameCollection.findOneAndDelete({});
      if (data) {
        return data;
      }
      return null;
    }

    // Initialize timer
    let timer = null;

    // Function to start the timer
    function startTimer() {
      timer = setInterval(async () => {
        const gameData = await addDataToUI();
        if (gameData) {
          // Send data to the UI
          io.emit('timerGame', gameData);
          // Reset the timer
          clearInterval(timer);
          startTimer();
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

app.get('/', (req, res) => {
  res.send('Gaming is on');
});

app.listen(port, () => {
  console.log(`Port is running on: ${port}`);
});
