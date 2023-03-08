const db = require("../db/connection");

exports.insertPostLike = async (user_id, post_id) => {
  const {
    rows: [row],
  } = await db.query(
    "INSERT INTO post_likes (user_id, post) VALUES ($1, $2) RETURNING *;",
    [user_id, post_id]
  );
  return row;
};

exports.removePostLike = async (user_id, post_id) => {
  const {
    rows: [row],
  } = await db.query(
    "DELETE FROM post_likes WHERE user_id=$1 AND post=$2 RETURNING *;",
    [user_id, post_id]
  );

  if (!row) return Promise.reject({ status: 404, msg: "Like Not Found" });

  return row;
};

exports.selectLikesByPostId = async (post_id) => {
  const { rows } = await db.query(
    `SELECT post_likes.user_id, profile_pic, username, name FROM post_likes 
    LEFT JOIN users
    ON post_likes.user_id = users.user_id
    WHERE post=$1 ORDER BY post_likes.created_at`,
    [post_id]
  );

  return rows;
};

exports.selectLikesByUserId = async (user_id) => {
  const { rows } = await db.query(
    `SELECT post FROM post_likes WHERE user_id = $1`,
    [user_id]
  );

  const likes = rows.map((item) => item.post);

  return likes;
};
