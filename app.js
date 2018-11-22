const app = require('express')();
const bodyParser = require('body-parser');
const apiRouter = require('./routes/api-router');
const {
  handle404s, handle400s, handle500s, handle422s,
} = require('./errors');

app.use(bodyParser.json());

app.use('/api', apiRouter);

app.use('/*', (req, res, next) => {
  next({ code: 'wildCard' });
});

app.use(handle404s);
app.use(handle400s);
app.use(handle422s);
app.use(handle500s);

module.exports = app;
