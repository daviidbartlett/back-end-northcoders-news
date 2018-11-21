const formatDate = time => new Date(time);


exports.formatArticle = (articleData, userRef) => articleData.map((articleDatum) => {
  const {
    title, topic, created_by, body, created_at,
  } = articleDatum;
  return {
    title,
    body,
    topic,
    user_id: userRef[created_by],
    created_at: formatDate(created_at),
  };
});

exports.formatComments = (commentData, userRef, articleRef) => commentData.map((commentDatum) => {
  const {
    body, belongs_to, created_by, votes, created_at,
  } = commentDatum;
  return {
    user_id: userRef[created_by],
    article_id: articleRef[belongs_to],
    body,
    votes,
    created_at: formatDate(created_at),
  };
});

exports.createRef = (rows, columnName_articles, idName_user) => rows.reduce((refObj, row) => {
  const primaryKey = row[columnName_articles];
  const rowVal = primaryKey;
  refObj[rowVal] = row[idName_user];
  return refObj;
}, {});
