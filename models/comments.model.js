const db = require("../db/connection");

exports.updateCommentById = async (body, comment_id) => {
  const {
    rows: [row],
  } = await db.query(
    `UPDATE comments SET body=$1 WHERE comment_id=$2 RETURNING *;`,
    [body, comment_id]
  );
  return row;
};

exports.selectCommentsByPostId = async (user_id) => {
  const { rows } = await db.query(
    "SELECT * FROM comments WHERE post=$1 ORDER BY created_at DESC;",
    [user_id]
  );
  if (!rows) return Promise.reject({ status: 404, msg: "User Not Found" });

  return rows;
};

exports.insertCommentByPostId = async (post_id, author, body, user_id) => {
  if (!author || !user_id || !body) {
    return Promise.reject({ status: 400, msg: "missing required fields" });
  }

  const {
    rows: [row],
  } = await db.query(
    "INSERT INTO comments (post, author, body, user_id) VALUES ($1, $2, $3, $4) RETURNING *;",
    [post_id, author, body, user_id]
  );
  return row;
};

exports.removeCommentById = async (comment_id) => {
  const {
    rows: [row],
  } = await db.query("DELETE FROM comments WHERE comment_id=$1 RETURNING *;", [
    comment_id,
  ]);

  if (!row) return Promise.reject({ status: 404, msg: "ID Not Found" });

  return row;
};
