const db = require("../db/connection");

exports.selectRatingsById = async (movie_id) => {
  const {
    rows: [row],
  } = await db.query(`SELECT AVG(rating) FROM ratings WHERE movie_id=$1`, [
    movie_id,
  ]);

  const result = parseFloat(row.avg).toFixed(1);

  return parseFloat(result);
};

exports.insertRatingById = async (
  movie_id,
  user_id,
  rating,
  movie_title,
  movie_poster
) => {
  const {
    rows: [row],
  } = await db.query(
    `INSERT INTO ratings (movie_id, user_id, rating, movie_title, movie_poster) VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
    [movie_id, user_id, rating, movie_title, movie_poster]
  );

  return row;
};

exports.removeRatingById = async (movie_id, user_id) => {
  const {
    rows: [row],
  } = await db.query(
    `DELETE FROM ratings WHERE movie_id=$1 AND user_id=$2 RETURNING *;`,
    [movie_id, user_id]
  );
  return row;
};

exports.updateRatingById = async (movie_id, user_id, rating) => {
  const {
    rows: [row],
  } = await db.query(
    `UPDATE ratings SET rating=$1 WHERE movie_id=$2 AND user_id=$3 RETURNING *;`,
    [rating, movie_id, user_id]
  );

  return row;
};
