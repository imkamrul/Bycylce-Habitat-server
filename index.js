const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const cors = require("cors");
const SslCommerzPayment = require("sslcommerz");
const { v4: uuidv4 } = require("uuid");
const app = express();
const port = process.env.PORT || 5000;
// middleware
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sbsxy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
async function run() {
  try {
    await client.connect();
    const database = client.db("ByCycleHabitat");
    const products = database.collection("Products");
    const reviews = database.collection("Reviews");
    const orders = database.collection("Orders");
    const users = database.collection("Users");
    const payment = database.collection("Payment");

    // selected api get api
    app.get("/selectedProduct/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await products.findOne(query);
      res.json(result);
    });
    // products get api
    app.get("/products", async (req, res) => {
      const limited = parseInt(req.query.search);
      let cursor = {};
      if (limited) {
        cursor = products.find({}).limit(limited);
      } else {
        cursor = products.find({});
      }
      const result = await cursor.toArray();
      res.json(result);
    });
    // products post api
    app.post("/products", async (req, res) => {
      const data = req.body;
      const result = await products.insertOne(data);
      res.json(result);
    });
    // reviews get api
    app.get("/reviews", async (req, res) => {
      const cursor = reviews.find({});
      const result = await cursor.toArray();
      res.json(result);
    });
    // reviews post api
    app.post("/reviews", async (req, res) => {
      const data = req.body;
      const result = await reviews.insertOne(data);
      res.json(result);
    });
    // orders post api
    app.post("/orders", async (req, res) => {
      const data = req.body;
      const result = await orders.insertOne(data);
      res.json(result);
    });
    // get  only my order api
    app.get("/myOrders", async (req, res) => {
      const search = req.query.search;
      const query = { email: search };
      const cursor = orders.find(query);
      const events = await cursor.toArray();

      res.json(events);
    });
    // get  all order api
    app.get("/allOrders", async (req, res) => {
      const cursor = orders.find({});
      const result = await cursor.toArray();
      res.json(result);
    });
    //  delete my order api
    app.delete("/orderDelete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orders.deleteOne(query);

      res.json(result);
    });
    // order status update api
    app.put("/orderStatusUpdate/:id", async (req, res) => {
      const id = req.params.id;
      const newStatus = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatePackage = {
        $set: {
          status: newStatus.Status,
        },
      };
      const result = await orders.updateOne(filter, updatePackage, options);
      res.json(result);
    });
    // delete orders  api
    app.delete("/orderDelete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orders.deleteOne(query);
      res.json(result);
    });
    // delete product  api
    app.delete("/productDelete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await products.deleteOne(query);
      res.json(result);
    });
    // get  sub catagories order  api
    app.get("/catagoriesOrder", async (req, res) => {
      const status = req.query.status;
      const query = { status: status };
      let cursor = {};
      if (status) {
        cursor = orders.find(query);
      } else {
        cursor = orders.find({});
      }
      const result = await cursor.toArray();
      res.json(result);
    });
    // get single product  api
    app.get("/singleProduct/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await products.findOne(query);
      res.json(result);
    });
    // update product api
    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const updatedProduct = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: updatedProduct.name,
          img: updatedProduct.img,
          price: updatedProduct.price,
          description: updatedProduct.description,
        },
      };
      const result = await products.updateOne(filter, updateDoc, options);
      res.json(result);
    });
    // user post api
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await users.insertOne(user);
      res.json(result);
    });
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await users.updateOne(filter, updateDoc, options);
      res.json(result);
    });
    // search admin api
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await users.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });
    app.put("/users/:admin", async (req, res) => {
      const AdminEmail = req.params.admin;
      const newAdmin = req.body.email;
      const requesterAccount = await users.findOne({ email: AdminEmail });
      if (requesterAccount.role === "admin") {
        const filter = { email: newAdmin };
        const updateDoc = { $set: { role: "admin" } };
        const result = await users.updateOne(filter, updateDoc);
        res.json(result);
      } else {
        res.send("Permission denied");
      }
    });
    // Initialize payment
    app.post("/make-payment", async (req, res) => {
      const productInfo = {
        total_amount: 100,
        currency: "BDT",
        tran_id: uuidv4(),
        success_url: "http://localhost:5000/success",
        fail_url: "http://localhost:5000/failure",
        cancel_url: "http://localhost:5000/cancel",
        ipn_url: "http://localhost:5000/ipn",
        paymentStatus: "pending",
        shipping_method: "Courier",
        product_name: "test",
        product_category: "Electronic",
        product_profile: "test",
        product_image: "test",
        cus_name: "test",
        cus_email: "kamrul",
        cus_add1: "Dhaka",
        cus_add2: "Dhaka",
        cus_city: "Dhaka",
        cus_state: "Dhaka",
        cus_postcode: "1000",
        cus_country: "Bangladesh",
        cus_phone: "01711111111",
        cus_fax: "01711111111",
        ship_name: "test",
        ship_add1: "Dhaka",
        ship_add2: "Dhaka",
        ship_city: "Dhaka",
        ship_state: "Dhaka",
        ship_postcode: 1000,
        ship_country: "Bangladesh",
        multi_card_name: "mastercard",
        value_a: "ref001_A",
        value_b: "ref002_B",
        value_c: "ref003_C",
        value_d: "ref004_D",
      };

      // Insert order info
      const result = await payment.insertOne(productInfo);

      const sslcommer = new SslCommerzPayment(
        process.env.STORE_ID,
        process.env.STORE_PASSWORD,
        false
      ); //true for live default false for sandbox
      sslcommer.init(productInfo).then((data) => {
        const info = { ...productInfo, ...data };

        if (info.GatewayPageURL) {
          res.json(info.GatewayPageURL);
        } else {
          return res.status(400).json({
            message: "SSL session was not successful",
          });
        }
      });
    });
    app.post("/success", async (req, res) => {
      const result = await payment.updateOne(
        { tran_id: req.body.tran_id },
        {
          $set: {
            val_id: req.body.val_id,
          },
        }
      );

      res.redirect(`http://localhost:3000/success/${req.body.tran_id}`);
    });
    app.post("/failure", async (req, res) => {
      const result = await payment.deleteOne({ tran_id: req.body.tran_id });

      res.redirect(`http://localhost:3000`);
    });
    app.post("/cancel", async (req, res) => {
      const result = await payment.deleteOne({ tran_id: req.body.tran_id });

      res.redirect(`http://localhost:3000`);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);
app.get("/", async (req, res) => {
  res.send("Cycle Habitat server running");
});
app.listen(port, () => {
  console.log("Cycle Habitat server port :", port);
});
