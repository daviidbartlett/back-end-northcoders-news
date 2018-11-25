const connection = require('../db/connection');

exports.getAllUsers = (req, res, next) => {
  connection('users')
    .select()
    .then(users => res.send({ users }))
    .catch(next);
};

exports.getUserById = (req, res, next) => {
  const { user_id } = req.params;
  return connection('users')
    .select()
    .where('user_id', '=', user_id)
    .then((user) => {
      if (user.length === 0) next({ code: 'noUsername' });
      else res.send({ user: user[0] });
    })
    .catch(next);
};
