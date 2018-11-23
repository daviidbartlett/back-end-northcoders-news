// const knex = require('knex');
// const config = require('../knexfile');

// const env = process.env.NODE_ENV || 'development';

// const connection = knex(config[env]);

// module.exports = connection;

const ENV = process.env.NODE_ENV || 'development';
const config = ENV === 'production'
  ? { client: 'pg', connection: `${process.env.DB_URL}?SSL=true` }
  : require('../knexfile')[ENV];

module.exports = require('knex')(config);
