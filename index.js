const express = require('express');
const cors = require('cors');
const app = express();
const morgan = require('morgan');
// const stripe = require('stripe')(process.env.PAYMENT_SECRET_KEY)
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// jwt
// const verifyJWT = (req, res, next) => {
//   const authorization = req.headers.authorization;
//   if (!authorization) {
//     return res.status(401).send({ error: true, message: 'unauthorized access' })
//   }
//   const token = authorization.split(' ')[1]
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//     if (err) {
//       return res.status(401).send({ error: true, message: 'unauthorized access' })
//     }
//     req.decoded = decoded
//     next()
//   })

// }


// const verifyAdmin = async(req, res, next) => {
//   const email = req.decoded.email
//   const query = {email: email}
//   const user = await userCollection.findOne(query)
//   if(user?.role !== 'Admin'){
//     return res.status(403).send({error: true, message: 'forbidden Access'})
//   }
//   next()
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
    const bookingsCollection = client.db('summerDB').collection('bookings')

    // jwt
    // app.post('/jwt', async (req, res) => {
    //   const email = req.body
    //   const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, {
    //     expiresIn: '7d'
    //   })
    //   res.send({ token })
    // })

    // verify admin
    // const verifyAdmin = async(req, res, next) => {
    //   const email = req.decoded.email
    //   const query = {email: email}
    //   const user = await usersCollection.findOne(query)
    //   if(user?.role !== 'admin'){
    //     return res.status(403).send({error: true, message: 'forbidden Access'})
    //   }
    //   next()
    // }

    // save user email and role
    app.put('/users/:email', async (req, res) => {
      const email = req.params.email
      const user = req.body
      const query = { email: email }
      const options = { upsert: true }
      const UpdateDoc = {
        $set: user,
      }
      const result = await userCollection.updateOne(query, UpdateDoc, options)
      console.log(result);
      res.send(result)
    })

    // get all users
    app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray()
      res.send(result)
    })

    // get admin
    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email
      const query = { email: email }
      const user = await userCollection.findOne(query)
      const result = { admin: user?.role === 'Admin' }
      res.send(result)
    })
    // get instructor
    app.get('/users/instructor/:email', async (req, res) => {
      const email = req.params.email
      const query = { email: email }
      const user = await userCollection.findOne(query)
      const result = { instructor: user?.role === 'Instructor' }
      res.send(result)
    })
    // get student
    app.get('/users/Student/:email', async (req, res) => {
      const email = req.params.email
      const query = { email: email }
      const user = await userCollection.findOne(query)
      const result = { student: user?.role === 'Student' }
      res.send(result)
    })

    // make admin
    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const updateDoc = {
        $set: {
          role: "Admin"
        }
      }
      const result = await userCollection.updateOne(query, updateDoc)
      res.send(result)
    })

    // make instructor
    app.patch('/users/instructor/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updateDoc = {
        $set: {
          role: "Instructor"
        }
      }
      const result = await userCollection.updateOne(filter, updateDoc)
      res.send(result)
    })

    // make student
    app.patch('/users/student/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updateDoc = {
        $set: {
          role: "Student"
        }
      }
      const result = await userCollection.updateOne(filter, updateDoc)
      res.send(result)
    })


    // approve class
    app.patch('/classes/approve/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updateDoc = {
        $set: {
          status: "approved"
        }
      }
      const result = await classCollection.updateOne(filter, updateDoc)
      res.send(result)
    })
    // deny class
    app.patch('/classes/deny/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updateDoc = {
        $set: {
          status: "denied"
        }
      }
      const result = await classCollection.updateOne(filter, updateDoc)
      res.send(result)
    })

    // post class
    app.post('/classes', async (req, res) => {
      const newItem = req.body
      const result = await classCollection.insertOne(newItem)
      res.send(result)
    })

    // post booking
    app.patch('/bookings', async (req, res) => {
      const { 
        id,
        classImage,
        instructorEmail,
         user,
         instructorName,
         name,
         price,
         } = req.body;
         
         const options = { upsert: true }
      const bookingData = {
        classImage,
        user,
        instructorEmail,
        instructorName,
        name,
        price,
        id
      };

      const result = await bookingsCollection.insertOne(bookingData,options);

      res.send(result)
    });

    // getBookings
    app.get('/bookings', async(req,res) => {
      const result = await bookingsCollection.find().toArray()
      res.send(result)
    })
    // delete  bookings
    app.delete('/bookings/delete/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await bookingsCollection.deleteOne(query);
      res.send(result)
    })


   // create payment intent
  //  app.post('/create-payment-intent',  async (req, res) => {
  //   const  price  = req.body;
  //   if(price){
  //     const amount = parseInt(price) * 100;
  //     const paymentIntent = await stripe.paymentIntents.create({
  //       amount: amount,
  //       currency: 'usd',
  //       payment_method_types: ['card']
  //     });
  //     res.send({clientSecret: paymentIntent.client_secret });
  //   }
    
  // });

    // sending feedback
    app.put('/classes/feedback/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const feedback = req.body.feedback;
        console.log(id, feedback);

        const filter = { _id: new ObjectId(id) };
        const update = {
          $set: {
            feedback: feedback,
          },
        };

        const result = await classCollection.updateOne(filter, update);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.status(500).send('Error updating class feedback.');
      }
    });

    // get all classes for client
    app.get('/classes', async (req, res) => {
      result = await classCollection.find().toArray();
      res.send(result)
    })
    // descending  classes
    app.get('/classes/descending', async (req, res) => {
      const result = await classCollection.find().sort({ enrolled: -1 }).limit(6).toArray();
      res.send(result);
    });

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