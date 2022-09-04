var cors = require("cors");
const app = require("express")();

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api", require("./routes"));

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
