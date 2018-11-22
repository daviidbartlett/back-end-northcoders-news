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

  const {
    limit = 10,
    p = 1,
    sort_ascending = 'false',
    sort_by = 'created_at',
    ...rest
  } = req.query;

  // const validQueries = validateQueries(
  //   rest,
  //   'max_age',
  //   'min_age',
  //   'exact_age',
  //   'forename',
  //   'surname',
  //   'age',
  // );
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
    .where('topic', '=', topic)
    .groupBy('articles.article_id', 'users.username')
    .count('comments.comment_id AS comment_count')
    .then((articles) => {
      if (articles.length === 0) next({ status: 404, msg: 'Topic not found.' });
      else if (articles.length === 1) res.send({ article: articles[0] });
      else res.send({ articles });
    });
};
