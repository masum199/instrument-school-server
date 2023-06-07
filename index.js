const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

// middleware
app.use(express.json());
app.use(cors());



app.get('/', (req, res) => {
    res.send('school is running');
  })
  
  app.listen(port, () => {
    console.log(`school is running on port${port}`)
  })