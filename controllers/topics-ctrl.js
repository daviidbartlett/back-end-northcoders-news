const connection = require('../db/connection');

exports.getAllTopics = (req, res, next) => {
  connection('topics')
    .select()
    .then((topics) => {
      res.send({ topics });
    })
    .catch(next);
};

exports.postTopic = (req, res, next) => {
  connection('topics')
    .insert(req.body)
    .returning('*')
    .then((topic) => {
      res.status(201).send({ newTopic: topic[0] });
    })
    .catch(next);
};

exports.getArticlesByTopic = (req, res, next) => {
  const { topic } = req.params;
  connection('articles')
    .select(
      'username AS author',
      'title',
      'articles.article_id',
      'articles.votes',
      'articles.created_at',
      'topic',
    )

    .join('users', 'users.user_id', '=', 'articles.user_id')
    .join('comments', 'comments.article_id', '=', 'articles.article_id')
    .where('topic', '=', topic)
    .groupBy('articles.article_id', 'users.username')
    .count('articles.article_id AS comment_count')
    .then((articles) => {
      if (articles.length === 0) next({ status: 404, msg: 'Topic not found.' });
      else if (articles.length === 1) res.send({ article: articles[0] });
      else res.send({ articles });
    });
};
