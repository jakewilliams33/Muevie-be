const db = require("../db/connection");

exports.removeWatchedById = async (user_id, movie_id) => {
  const {
    rows: [row],
  } = await db.query(
    "DELETE FROM watched WHERE user_id=$1 AND movie_id=$2 RETURNING *;",
    [user_id, movie_id]
  );

  if (!row) return Promise.reject({ status: 404, msg: "ID Not Found" });

  return row;
};

exports.selectWatchedByUserId = async (user_id, order = "DESC") => {
  if (!["ASC", "DESC"].includes(order)) {
    return Promise.reject({ status: 400, msg: "Invalid order query" });
  }
  const { rows } = await db.query(
    `SELECT * FROM watched WHERE user_id=$1 ORDER BY created_at ${order};`,
    [user_id]
  );
  if (!rows) return Promise.reject({ status: 404, msg: "User Not Found" });

  return rows;
};

exports.insertWatchedByUserId = async (
  user_id,
  { movie_id, movie_poster, movie_title }
) => {
  const {
    rows: [row],
  } = await db.query(
    "INSERT INTO watched (user_id, movie_id, movie_poster, movie_title) VALUES ($1, $2, $3, $4) RETURNING *;",
    [user_id, movie_id, movie_poster, movie_title]
  );
  return row;
};
