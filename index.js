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
        const orders = database.collection('Orders');
        const users = database.collection('Users');

        // selected api get api 
        app.get('/selectedProduct/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await products.findOne(query);

            res.json(result)
        })
        // products get api 
        app.get('/products', async (req, res) => {
            const limited = parseInt(req.query.search);
            let cursor = {}
            if (limited) {
                cursor = products.find({}).limit(limited);
            } else {
                cursor = products.find({});
            }
            const result = await cursor.toArray();
            res.json(result)
        })
        // products post api 
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
        // orders post api 
        app.post('/orders', async (req, res) => {
            const data = req.body;
            const result = await orders.insertOne(data);
            res.json(result);
        })
        // get  only my order api 
        app.get('/myOrders', async (req, res) => {
            const search = req.query.search;
            const query = { email: search };
            const cursor = orders.find(query);
            const events = await cursor.toArray();

            res.json(events);
        })
        // get  all order api 
        app.get('/allOrders', async (req, res) => {
            const cursor = orders.find({});
            const result = await cursor.toArray();
            res.json(result);
        })
        //  delete my order api 
        app.delete('/orderDelete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orders.deleteOne(query);

            res.json(result)
        })
        // order status update api 
        app.put('/orderStatusUpdate/:id', async (req, res) => {
            const id = req.params.id;
            const newStatus = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatePackage = {
                $set: {
                    status: newStatus.Status
                }
            }
            const result = await orders.updateOne(filter, updatePackage, options)
            res.json(result)
        })
        // delete orders  api 
        app.delete('/orderDelete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orders.deleteOne(query);
            res.json(result)

        })
        // delete product  api 
        app.delete('/productDelete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await products.deleteOne(query);
            res.json(result)

        })
        // get  sub catagories order  api 
        app.get('/catagoriesOrder', async (req, res) => {
            const status = req.query.status;
            const query = { status: status };
            let cursor = {}
            if (status) {
                cursor = orders.find(query);
            } else {
                cursor = orders.find({});
            }
            const result = await cursor.toArray();
            res.json(result)
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