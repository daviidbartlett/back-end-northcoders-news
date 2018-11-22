const articlesRouter = require('express').Router();
const { getAllArticles, getArticleById } = require('../controllers/articles-ctrl');
const { handle405s, handle400s } = require('../errors');

articlesRouter.param('article_id', (req, res, next) => {
  if (!/^\d+$/.test(req.params.article_id)) {
    next({ code: 'article_id' });
  }
  next();
});

articlesRouter
  .route('/')
  .get(getAllArticles)
  .all(handle405s);

articlesRouter.route('/:article_id').get(getArticleById);

module.exports = articlesRouter;
