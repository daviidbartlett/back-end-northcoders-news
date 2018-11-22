const apiRouter = require('express').Router();
const topicsRouter = require('./topics-router');
const articlesRouter = require('./articles-router');
const usersRouter = require('./users-router');
const { handle405s } = require('../errors/index');

apiRouter.use('/topics', topicsRouter);
apiRouter.use('/articles', articlesRouter);
apiRouter.use('/users', usersRouter);

apiRouter
  .route('/')
  .get((req, res, next) => res.send({ msg: 'Welcome!' }))
  .all(handle405s);

module.exports = apiRouter;
