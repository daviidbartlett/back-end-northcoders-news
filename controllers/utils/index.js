const connection = require('../../db/connection');

exports.getArticlesWithCommentCount = (queries) => {
  const {
    limit = 10, p = 1, sort_ascending = 'false', sort_by = 'created_at',
  } = queries;
  let sortDirection = 'desc';
  if (sort_ascending === 'true') {
    sortDirection = 'asc';
  }
  return connection('articles')
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
    .count('comments.comment_id AS comment_count');
};

exports.checkIfArticleExistsFirst = query => connection('articles')
  .select()
  .where('article_id', '=', query);
