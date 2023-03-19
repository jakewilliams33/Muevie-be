const db = require("../db/connection");

exports.removeFavouriteById = async (user_id, movie_id) => {
  const {
    rows: [row],
  } = await db.query(
    "DELETE FROM favourites WHERE user_id=$1 AND movie_id=$2 RETURNING *;",
    [user_id, movie_id]
  );

  if (!row) return Promise.reject({ status: 404, msg: "Favourite Not Found" });

  return row;
};

exports.selectFavouritesByUserId = async (user_id, order = "DESC") => {
  if (!["ASC", "DESC"].includes(order)) {
    return Promise.reject({ status: 400, msg: "Invalid order query" });
  }
  const { rows } = await db.query(
    `SELECT * FROM favourites WHERE user_id=$1 ORDER BY created_at ${order};`,
    [user_id]
  );

  return rows;
};

exports.insertFavouriteByUserId = async (
  user_id,
  { movie_id, movie_poster, movie_title }
) => {
  if (!user_id || !movie_id || !movie_title)
    return Promise.reject({ status: 400, msg: "missing required fields" });

  const {
    rows: [row],
  } = await db.query(
    "INSERT INTO favourites (user_id, movie_id, movie_poster, movie_title) VALUES ($1, $2, $3, $4) RETURNING *;",
    [user_id, movie_id, movie_poster, movie_title]
  );

  return row;
};
