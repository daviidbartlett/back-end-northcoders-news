const usersRouter = require('express').Router();
const { getAllUsers, getUserById } = require('../controllers/users-ctrl');
const { handle405s } = require('../errors');

usersRouter
  .route('/')
  .get(getAllUsers)
  .all(handle405s);

usersRouter
  .route('/:username')
  .get(getUserById)
  .all(handle405s);

module.exports = usersRouter;
