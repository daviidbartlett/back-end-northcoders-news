exports.sendApiMap = (req, res, next) => {
  const mapObj = {
    api: {
      '/api/': { GET: 'fetch API endpoints map' },
      topics: {
        '/api/topics/': { GET: 'fetch all topics', POST: 'post new topic' },
        '/api/topcics/:topic/articles': {
          GET: 'fetch all articles by topics',
          POST: 'post new article by topic',
        },
      },
      articles: {
        '/api/articles/': { GET: 'fetch all articles' },
        '/api/articles/:article_id': {
          GET: 'fetch single article by article ID',
          PATCH: 'update single aritcle by article ID',
          DELETE: 'remove single article by article ID',
        },
        comments: {
          '/api/articles/:article_id/comments/': {
            GET: 'fetch all comments by article ID',
            POST: 'post new comment to article ID',
          },
          '/api/article/:article_id/comments/:comment_id': {
            PATCH: 'update single comment by comment ID',
            DELETE: 'remove single comment by comment ID',
          },
        },
      },
      comments: '',
      users: {
        '/api/users/': { GET: 'fetch all users' },
        '/api/users/:user_id': { GET: 'fetch single user by user ID' },
      },
    },
  };

  res.send(mapObj);
};
