const express = require("express");
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID


const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dspyj.mongodb.net/organicDb?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

client.connect((err) => {
  const productCollection = client.db("organicDb").collection("products");

  app.get("/products", (req, res) => {
    productCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
  
  app.get("/product/:id", (req, res) => {
    productCollection.find({_id: ObjectID(req.params.id)})
    .toArray((err, documents) =>{
      res.send(documents[0]);
    })
  });

  app.post("/addProduct", (req, res) => {
    const product = req.body;
    // console.log(product);
    productCollection.insertOne(product).then((result) => {
      console.log("product added successfully");
      res.redirect('/');
    });
    //     console.log('database connected');
    //     // perform actions on the collection object
    //     //   client.close();
  });
  
  app.patch("/update/:id", (req, res) => {
    console.log(req.body.price);
    productCollection.updateOne({_id: ObjectID(req.params.id)},
    {
      $set: {price: req.body.price, quantity: req.body.quantity}
    })
    .then ( result => {
      res.send(result.modifiedCount > 0)
    })
  })

  app.delete("/delete/:id", (req, res) => {
    productCollection.deleteOne({_id: ObjectID(req.params.id)})
    .then((result) =>{
      console.log(result);
      res.send(result.deletedCount > 0);
    })
  });
});

app.listen(3000, () => console.log("listening to port 3000"));
