const router = require("express").Router();
const controller = require("./controllers");
router.get("/", (req, res) => {
  res.send("Hello Routes!");
});

router.get("/trending", controller.test);
router.get("/getMagnets", controller.getMagnets);
router.get("/search", controller.search);

module.exports = router;
