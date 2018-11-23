const commentsRouter = require('express').Router({ mergeParams: true });
const {
  getAllCommentsByArticleId,
  postNewCommentToArticleId,
  updateCommentById,
} = require('../controllers/comments-ctrl');
const { handle405s } = require('../errors');

commentsRouter
  .route('/')
  .get(getAllCommentsByArticleId)
  .post(postNewCommentToArticleId)
  .all(handle405s);
commentsRouter
  .route('/:comment_id')
  .get(updateCommentById)
  .all(handle405s);
module.exports = commentsRouter;
