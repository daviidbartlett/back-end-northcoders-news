const topicsRouter = require('express').Router();
const {
  getAllTopics,
  postTopic,
  getArticlesByTopic,
  postArticle,
} = require('../controllers/topics-ctrl');
const { handle405s } = require('../errors');

topicsRouter
  .route('/')
  .get(getAllTopics)
  .post(postTopic)
  .all(handle405s);

topicsRouter
  .route('/:topic/articles')
  .get(getArticlesByTopic)
  .post(postArticle)
  .all(handle405s);

module.exports = topicsRouter;
