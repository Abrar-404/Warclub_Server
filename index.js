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
    const timerGameCollection = client.db('gamesCollection').collection('timerGame');

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





// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();
// const { MongoClient, ServerApiVersion } = require('mongodb');
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
//     await client.connect(); // Connect to MongoDB

//     const allGamesCollection = client.db('gamesCollection').collection('games');
//     const timerGameCollection = client
//       .db('gamesCollection')
//       .collection('timerGame');

//     app.get('/games', async (req, res) => {
//       const result = await allGamesCollection.find().toArray();
//       res.send(result);
//     });

//       app.get('/timerGame', async (req, res) => {
//         const result = await timerGameCollection.find().toArray();
//         res.send(result);
//       });

//     app.post('/timerGame', async (req, res) => {
//       try {
//         const insertedId = await addNewGameToTimerCollection(
//           timerGameCollection
//         );
//         res.json({
//           message: 'New game added successfully.',
//           gameId: insertedId,
//         });
//       } catch (error) {
//         console.error('Error adding new game to timer collection:', error);
//         res.status(500).json({ error: 'Failed to add new game.' });
//       }
//     });

//     await client.db('admin').command({ ping: 1 });
//     console.log(
//       'Pinged your deployment. You successfully connected to MongoDB!'
//     );
//   } catch (error) {
//     console.error('Error connecting to MongoDB:', error);
//   }
// }

// async function addNewGameToTimerCollection(timerCollection) {
//   try {
//     const newGame = {
//       // Define the fields for your new game document
//       // For example:
//       name: 'New Game Name',
//       description: 'New Game Description',
//       // Add other fields as needed
//     };
//     const result = await timerCollection.insertOne(newGame);
//     console.log('New game added to timer collection:', result.insertedId);
//     return result.insertedId; // Return the ID of the inserted document if needed
//   } catch (error) {
//     throw new Error(
//       'Failed to add new game to timer collection: ' + error.message
//     );
//   }
// }

// run().catch(console.dir);

// app.get('/', (req, res) => {
//   res.send('Gaming is on');
// });

// app.listen(port, () => {
//   console.log(`Port is running on: ${port}`);
// });
