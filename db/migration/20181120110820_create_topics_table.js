exports.up = function(knex, Promise) {
  console.log("creating topics table");
  return knex.schema.createTable("topics", topicsTable => {
    topicsTable
      .string("slug")
      .unique()
      .primary();
    topicsTable.string("description");
  });
};

exports.down = function(knex, Promise) {
  console.log("dropping topics table");
  return knex.schema.dropTable("topics");
};
