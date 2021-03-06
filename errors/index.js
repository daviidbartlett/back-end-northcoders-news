exports.handle405s = (req, res, next) => res.status(405).send({ msg: 'Method not allowed on path.' });

exports.handle404s = (err, req, res, next) => {
  const errObj = {
    '22P02': "Parametric endpoint doesn't exist.",
    23503: `Parametric endpoint doesn't exist. ${err.detail}`,
    wildCard: 'Page not found.',
    noTopic: 'Topic not found.',
    noArticle: 'Article_id not found.',
    noUsername: 'Username not found.',
    noComments: 'There are no comments found for that article.',
  };
  if (errObj[err.code]) {
    return res.status(404).send({ msg: errObj[err.code] });
  }
  return next(err);
};

exports.handle400s = (err, req, res, next) => {
  const errObj = {
    stringVote: 'Type error. inc_vote should be of type int.',
    user_id: 'Type error. user_id should be int.',
    article_id: 'Type error. article_id should be int.',
    comment_id: 'Type error. comment_id  should be int.',
    23502: 'Malformed body, ensure posted data is of correct format.',
    42703: 'Malformed body, ensure posted data is of correct format.',
  };
  if (errObj[err.code]) {
    return res.status(400).send({ msg: errObj[err.code] });
  }
  return next(err);
};
exports.handle422s = (err, req, res, next) => {
  const errObj = { 23505: `${err.detail}` };
  if (errObj[err.code]) return res.status(422).send({ msg: errObj[err.code] });
  return next(err);
};

exports.handle500s = (err, req, res, next) => {
  res.status(500).send({ msg: 'internal server error' });
};
