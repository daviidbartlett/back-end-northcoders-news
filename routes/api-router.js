const apiRouter = require("express").Router();
const topicsRouter = require("./topics-router");

apiRouter.use("/topics", topicsRouter);

apiRouter.get("/", (req, res, next) => {
  res.send({ msg: "Welcome!" });
});

module.exports = apiRouter;
