const topicsRouter = require('express').Router();
const { getAllTopics, postTopic, getArticlesByTopic } = require('../controllers/topics-ctrl');
const { handle405s } = require('../errors');

topicsRouter
  .route('/')
  .get(getAllTopics)
  .post(postTopic)
  .all(handle405s);

topicsRouter
  .route('/:topic/articles')
  .get(getArticlesByTopic)
  .all(handle405s);

module.exports = topicsRouter;
