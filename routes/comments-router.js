const commentsRouter = require('express').Router({ mergeParams: true });
const {
  getAllCommentsByArticleId,
  postNewCommentToArticleId,
  updateVotesOnCommentId,
  deleteCommentById,
} = require('../controllers/comments-ctrl');
const { handle405s } = require('../errors');

commentsRouter.param('comment_id', (req, res, next) => {
  if (!/^\d+$/.test(req.params.comment_id)) {
    next({ code: 'comment_id' });
  } else next();
});

commentsRouter
  .route('/')
  .get(getAllCommentsByArticleId)
  .post(postNewCommentToArticleId)
  .all(handle405s);
commentsRouter
  .route('/:comment_id')
  .patch(updateVotesOnCommentId)
  .delete(deleteCommentById)
  .all(handle405s);
module.exports = commentsRouter;
