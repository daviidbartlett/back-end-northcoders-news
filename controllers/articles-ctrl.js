const connection = require('../db/connection');
const { getSomethingWithCommentCount } = require('./utils');

exports.getAllArticles = (req, res, next) => {
  const {
    limit = 10, p = 1, sort_ascending = 'false', sort_by = 'created_at',
  } = req.query;

  let sortDirection = 'desc';
  if (sort_ascending === 'true') {
    sortDirection = 'asc';
  }

  connection('articles')
    .select(
      'username AS author',
      'title',
      'articles.article_id',
      'articles.votes',
      'articles.created_at',
      'topic',
    )
    .limit(limit)
    .offset((p - 1) * limit)
    .orderBy(sort_by, sortDirection)
    .join('users', 'users.user_id', '=', 'articles.user_id')
    .leftJoin('comments', 'comments.article_id', '=', 'articles.article_id')
    .groupBy('articles.article_id', 'users.username')
    .count('comments.comment_id AS comment_count')
    .then((articles) => {
      if (articles.length === 0) next({ status: 404, msg: 'Topic not found.' });
      else if (articles.length === 1) res.send({ article: articles[0] });
      else res.send({ articles });
    })
    .catch(next);
};

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;

  getSomethingWithCommentCount('articles', req.query)
    .where('articles.article_id', '=', article_id)
    .then((article) => {
      if (article.length === 0) next({ code: 'noArticle' });
      else res.send({ article: article[0] });
    })
    .catch(next);
};

exports.updateVotesOnArticleById = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  if (typeof inc_votes !== 'number') {
    next({ code: 'stringVote' });
  } else {
    connection('articles')
      .increment('votes', inc_votes)
      .where('articles.article_id', '=', article_id)
      .returning('*')
      .then((article) => {
        if (article.length === 0) next({ code: 'noArticle' });
        else res.send({ article: article[0] });
      })
      .catch(next);
  }
};

exports.deleteArticleById = (req, res, next) => {
  const { article_id } = req.params;
  connection('articles')
    .where('articles.article_id', '=', article_id)
    .del()
    .then((deletedArticle) => {
      res.send({ deletedArticle });
    });
};
