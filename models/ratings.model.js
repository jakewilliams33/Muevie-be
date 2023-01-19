const db = require("../db/connection");

exports.selectRatingsById = async (imdb_id) => {
  const {
    rows: [row],
  } = await db.query(`SELECT AVG(rating) FROM ratings WHERE imdb_id=$1`, [
    imdb_id,
  ]);

  const result = parseFloat(row.avg).toFixed(1);

  return parseFloat(result);
};

exports.insertRatingById = async (
  imdb_id,
  user_id,
  rating,
  movie_title,
  movie_poster
) => {
  const {
    rows: [row],
  } = await db.query(
    `INSERT INTO ratings (imdb_id, user_id, rating, movie_title, movie_poster) VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
    [imdb_id, user_id, rating, movie_title, movie_poster]
  );

  return row;
};

exports.removeRatingById = async (imdb_id, user_id) => {
  const {
    rows: [row],
  } = await db.query(
    `DELETE FROM ratings WHERE imdb_id=$1 AND user_id=$2 RETURNING *;`,
    [imdb_id, user_id]
  );
  return row;
};

exports.updateRatingById = async (imdb_id, user_id, rating) => {
  const {
    rows: [row],
  } = await db.query(
    `UPDATE ratings SET rating=$1 WHERE imdb_id=$2 AND user_id=$3 RETURNING *;`,
    [rating, imdb_id, user_id]
  );

  return row;
};
