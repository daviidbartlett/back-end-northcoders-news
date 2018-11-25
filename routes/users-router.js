const usersRouter = require('express').Router();
const { getAllUsers, getUserById } = require('../controllers/users-ctrl');
const { handle405s } = require('../errors');

usersRouter.param('user_id', (req, res, next) => {
  if (!/^\d+$/.test(req.params.user_id)) {
    next({ code: 'user_id' });
  } else next();
});

usersRouter
  .route('/')
  .get(getAllUsers)
  .all(handle405s);

usersRouter
  .route('/:user_id')
  .get(getUserById)
  .all(handle405s);

module.exports = usersRouter;
