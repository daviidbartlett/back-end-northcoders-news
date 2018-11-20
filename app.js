const app = require("express")();
const bodyParser = require("body-parser");
const apiRouter = require("./routes/api-router");
app.use(bodyParser.json());

app.use("/api", apiRouter);
app.use("/*", (req, res, next) => {
  next({ status: 400, msg: "Page not found." });
});

app.use((err, req, res, next) => {
  if (err.status) res.status(err.status).send(err.msg);
  else res.status(500).send({ msg: "Internal server error." });
});

module.exports = app;
