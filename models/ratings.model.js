const db = require("../db/connection");
const format = require("pg-format");

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
  movie_poster,
  media_type
) => {
  const {
    rows: [row],
  } = await db.query(
    `INSERT INTO ratings (movie_id, user_id, rating, movie_title, movie_poster, media_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`,
    [movie_id, user_id, rating, movie_title, movie_poster, media_type]
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

exports.selectRatingsByUserId = async (user_id, movie_id) => {
  const filterMovie = movie_id ? format(`AND movie_id = %L`, movie_id) : "";

  const { rows } = await db.query(
    `SELECT * FROM ratings WHERE user_id=$1 ${filterMovie} ORDER BY created_at`,
    [user_id]
  );
  return rows;
};
