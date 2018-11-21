const connection = require('../db/connection');

exports.getAllTopics = (req, res, next) => {
  connection('topics')
    .select()
    .then((topics) => {
      res.send({ topics });
    })
    .catch(next);
};
