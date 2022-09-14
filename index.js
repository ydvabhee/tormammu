var cors = require("cors");
const express = require("express");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api", require("./routes"));

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
