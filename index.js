const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
// middleware 
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sbsxy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect();
        // console.log("database conneted")

        const database = client.db('ByCycleHabitat');
        const products = database.collection('Products');
        const reviews = database.collection('Reviews');
        const users = database.collection('Users');

        // reviews get api 
        app.get('/products', async (req, res) => {
            const cursor = products.find({});
            const result = await cursor.toArray();
            res.json(result)
        })
        // products add api 
        app.post('/products', async (req, res) => {
            const data = req.body;
            const result = await products.insertOne(data);
            res.json(result);
        })
        // reviews get api 
        app.get('/reviews', async (req, res) => {
            const cursor = reviews.find({});
            const result = await cursor.toArray();
            res.json(result)
        })
        // reviews post api 
        app.post('/reviews', async (req, res) => {
            const data = req.body;
            const result = await reviews.insertOne(data);
            res.json(result);
        })

    }


    finally {
        // await client.close();
    }
}
run().catch(console.dir);
app.get('/', async (req, res) => {
    res.send("Cycle Habitat server running");
})
app.listen(port, () => {
    console.log("Cycle Habitat server port :", port)
})