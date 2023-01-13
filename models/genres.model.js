const db = require("../db/connection");
const genres = require("../db/data/test-data/genres");

exports.selectGenresById = async (post_id) => {
  const { rows } = await db.query(`SELECT genre FROM genres WHERE post=$1`, [
    post_id,
  ]);

  return rows;
};

exports.insertGenresById = async (post_id, genres) => {
  const genresArr = genres.split(", ");
  const resultArr = [];

  for (let i = 0; i < genresArr.length; i++) {
    const {
      rows: [row],
    } = await db.query(
      `INSERT INTO genres (post, genre) VALUES ($1, $2) RETURNING *;`,
      [post_id, genresArr[i].toLowerCase()]
    );
    resultArr.push(row);
  }

  return resultArr;
};

exports.removeGenre = async (post_id, genre) => {
  const {
    rows: [row],
  } = await db.query(
    `DELETE FROM genres WHERE post=$1 AND genre=$2 RETURNING *;`,
    [post_id, genre]
  );
  return row;
};
