exports.up = function(knex, Promise) {
  console.log("creating comments table");
  return knex.schema.createTable("comments", commentsTable => {
    commentsTable.increments("comment_id").primary();
    commentsTable.integer("user_id").references("users.user_id");
    commentsTable.integer("article_id").references("articles.article_id");
    commentsTable.integer("votes").defaultTo(0);
    commentsTable.date("created_at").defaultTo(knex.fn.now());
    commentsTable.string("body", 9999);
  });
};

exports.down = function(knex, Promise) {
  console.log("dropping comments table");
  return knex.schema.dropTable("comments");
};
