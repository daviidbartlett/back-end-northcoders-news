exports.up = function(knex, Promise) {
  return knex.schema.createTable("articles", articlesTable => {
    console.log("creating articles table.");
    articlesTable.increments("article_id").primary();
    articlesTable.string("title").notNullable();
    articlesTable.string("body", 9999).notNullable();
    articlesTable
      .integer("votes")
      .notNullable()
      .defaultTo(0);
    articlesTable.string("topic").references("topics.slug");
    articlesTable.integer("user_id").references("users.user_id");
    articlesTable.date("created_at");
  });
};

exports.down = function(knex, Promise) {
  console.log("dropping articles table");
  return knex.schema.dropTable("articles");
};
