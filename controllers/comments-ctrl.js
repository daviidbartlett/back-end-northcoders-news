const connection = require('../db/connection');
const { checkIfArticleExistsFirst } = require('./utils');

exports.getAllCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;

  const {
    limit = 10, p = 1, sort_ascending = 'false', sort_by = 'created_at',
  } = req.query;
  let sortDirection = 'desc';
  if (sort_ascending === 'true') {
    sortDirection = 'asc';
  }

  return connection('comments')
    .select('comment_id', 'votes', 'created_at', 'username AS author', 'body')
    .limit(limit)
    .offset((p - 1) * limit)
    .orderBy(sort_by, sortDirection)
    .where('article_id', '=', article_id)
    .join('users', 'users.user_id', '=', 'comments.user_id')
    .then((comments) => {
      if (comments.length === 0) next({ code: 'noComments' });
      else res.send({ comments });
    })
    .catch(next);
};

exports.postNewCommentToArticleId = (req, res, next) => {
  const { article_id } = req.params;
  req.body.article_id = article_id;
  return connection('articles')
    .select()
    .where('article_id', '=', article_id)
    .then((article) => {
      if (article.length === 0) return next({ code: 'noArticle' });

      return connection('comments')
        .insert(req.body)
        .returning('*')
        .then((comment) => {
          res.status(201).send({ comment: comment[0] });
        })
        .catch(next);
    });
};

exports.updateVotesOnCommentId = (req, res, next) => {
  const { comment_id } = req.params;
  const { inc_votes } = req.body;
  if (typeof inc_votes !== 'number') {
    return next({ code: 'stringVote' });
  }
  return connection('comments')
    .increment('votes', inc_votes)
    .where('comment_id', '=', comment_id)
    .returning('*')
    .then((comment) => {
      if (comment.length === 0) next({ code: 'noArticle' });
      else {
        res.send({ comment: comment[0] });
      }
    })
    .catch(next);
};

exports.deleteCommentById = (req, res, next) => {
  const { comment_id } = req.params;
  checkIfArticleExistsFirst(comment_id).then((article) => {
    if (article.length === 0) return next({ code: 'noArticle' });

    return connection('comments')
      .where('comment_id', '=', comment_id)
      .del()
      .then(() => {
        res.send({});
      })
      .catch();
  });
};
