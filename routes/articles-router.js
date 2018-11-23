const articlesRouter = require('express').Router();
const commentsRouter = require('./comments-router');
const {
  getAllArticles,
  getArticleById,
  updateVotesOnArticleById,
  deleteArticleById,
} = require('../controllers/articles-ctrl');
const { handle405s } = require('../errors');

articlesRouter.param('article_id', (req, res, next) => {
  if (!/^\d+$/.test(req.params.article_id)) {
    next({ code: 'article_id' });
  } else next();
});

articlesRouter.use('/:article_id/comments', commentsRouter);

articlesRouter
  .route('/')
  .get(getAllArticles)
  .all(handle405s);

articlesRouter
  .route('/:article_id')
  .get(getArticleById)
  .patch(updateVotesOnArticleById)
  .delete(deleteArticleById)
  .all(handle405s);

module.exports = articlesRouter;
