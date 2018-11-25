const connection = require('../db/connection');
const { getArticlesWithCommentCount } = require('./utils');

exports.getAllArticles = (req, res, next) => {
  getArticlesWithCommentCount(req.query)
    .then((articles) => {
      if (articles.length === 0) next({ status: 404, msg: 'Topic not found.' });
      else if (articles.length === 1) res.send({ article: articles[0] });
      else res.send({ articles });
    })
    .catch(next);
};

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;

  getArticlesWithCommentCount(req.query)
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
    .then(() => {
      res.send({});
    });
};
