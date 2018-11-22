const connection = require('../db/connection');

exports.getAllUsers = (req, res, next) => {
  connection('users')
    .select()
    .then(users => res.send({ users }))
    .catch(next);
};

exports.getUserById = (req, res, next) => {
  const { username } = req.params;
  return connection('users')
    .select()
    .where('username', '=', username)
    .then((user) => {
      if (user.length === 0) next({ code: 'noUsername' });
      else res.send({ user: user[0] });
    })
    .catch(next);
};
