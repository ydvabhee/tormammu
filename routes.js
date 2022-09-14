const router = require("express").Router();
const controller = require("./controllers");
const dotenv = require("dotenv");

dotenv.config();
const { MongoClient } = require("mongodb");

// Connection URI
const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

MongoClient.connect(uri, { useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.log("Error connecting to database");
    return;
  }
  let db = client.db(dbName);
  console.log("Connected to database");
  router.get("/", (req, res) => {
    res.send("Hello Routes!");
  });

  router.post("/createShareLink", (req, res) => controller.createShareLink(req, res, db));
  router.get("/getSharedLink", (req, res) => controller.getSharedLink(req, res, db));
});
router.get("/trending", controller.test);
router.get("/getMagnets", controller.getMagnets);
router.get("/search", controller.search);
module.exports = router;
