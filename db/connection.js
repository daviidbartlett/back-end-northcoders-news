const knex = require("knex");
const env = process.env.NODE_ENV;
const dbToConnectTo = env === "test" ? "nc_knews_test" : "nc_knews";
const db = knex({
  client: "pg",
  connection: `postgres://localhost:5432/${dbToConnectTo}`
});

module.exports = db;
