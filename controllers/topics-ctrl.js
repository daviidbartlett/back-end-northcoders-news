const db = require("../db/connection");

exports.getAllTopics = (req, res, next) => {
  console.log("getting all topics");
  db("topics")
    .select()
    .then(topics => {
      console.log(topics);
      res.send({ topics });
    })
    .catch(next);
};
