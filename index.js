const express = require('express');
const cors = require('cors');
const app = express();
const morgan = require('morgan');
const port = process.env.PORT || 5000;
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

// middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// jwt
// const verifyJWT = (req, res, next) => {
//   const authorization = req.headers.authorization;
//   if(!authorization){
//     return res.status(401).send({error: true, message: 'unauthorized access'})
//   }
//   const token = authorization.split(' ')[1]
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) =>{
//     if(err){
//       return res.status(401).send({error: true, message: 'unauthorized access'})
//     }
//     req.decoded = decoded
//     next()
//   })
// }


// mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uya6aoa.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const userCollection = client.db('summerDB').collection('users');
    const classCollection = client.db('summerDB').collection('classes')


    // save user email and role
  app.put('/users/:email', async (req, res) =>{
    const email = req.params.email
    const user = req.body
    const query = { email: email }
    const options = { upsert: true }
    const UpdateDoc = {
      $set: user,
    }
    const result = await userCollection.updateOne(query,UpdateDoc,options)
    console.log(result);
    res.send(result)
  })


  app.post('/classes',  async (req, res) => {
    const newItem = req.body
    const result = await classCollection.insertOne(newItem)
    res.send(result)
  })

  app.get('/classes', async (req, res) => {
    result = await classCollection.find().toArray();
    res.send(result)
  })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('school is running');
  })
  
  app.listen(port, () => {
    console.log(`school is running on port${port}`)
  })