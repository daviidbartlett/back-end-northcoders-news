exports.handle404s = (err, req, res, next) => {
  if (err.status === 404) {
    return res.status(404).send({ msg: 'Page not found.' });
  }
  next(err);
};

exports.handle500s = (err, req, res, next) => {
  res.status(500).send({ msg: 'internal server error' });
};
