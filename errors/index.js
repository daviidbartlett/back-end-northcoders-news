exports.handle405s = (req, res, next) => res.status(405).send({ msg: 'Method not allowed on path.' });

exports.handle404s = (err, req, res, next) => {
  if (err.status === 404) {
    return res.status(404).send({ msg: err.msg || 'Page not found.' });
  }
  return next(err);
};

exports.handle400s = (err, req, res, next) => {
  const errObj = { 23502: 'Malformed body, ensure posted data is of correct format.' };
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
