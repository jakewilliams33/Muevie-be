const db = require("../db/connection");
const genres = require("../db/data/development-data/genres");

exports.selectGenresById = async (post_id) => {
  const { rows } = await db.query(`SELECT genre_id FROM genres WHERE post=$1`, [
    post_id,
  ]);

  return rows;
};

exports.insertGenresById = async (post_id, genre) => {
  const {
    rows: [row],
  } = await db.query(
    `INSERT INTO genres (post, genre_id) VALUES ($1, $2) RETURNING *;`,
    [post_id, genre]
  );

  return row;
};

exports.removeGenre = async (post_id, genre) => {
  const {
    rows: [row],
  } = await db.query(
    `DELETE FROM genres WHERE post=$1 AND genre_id=$2 RETURNING *;`,
    [post_id, genre]
  );
  return row;
};
