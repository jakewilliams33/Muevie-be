const format = require("pg-format");
const db = require("../db/connection");

exports.selectUsers = async () => {
  const { rows } = await db.query(`SELECT username,
user_id,	
name,	
email,	
profile_pic,
created_at FROM users;`);
  return rows;
};

exports.selectUserById = async (user_id) => {
  const {
    rows: [row],
  } = await db.query(
    `
      SELECT username, a.user_id, name, email, profile_pic, created_at, 
      COALESCE(userFollowing, 0) AS following, 
      COALESCE(userFollowers, 0) AS followers
      FROM (SELECT * FROM users WHERE user_id=$1) a
      LEFT JOIN
      (SELECT following, count(following)::int AS userFollowers FROM followers WHERE following=$1 GROUP BY following) b
      ON a.user_id = b.following
      LEFT JOIN
      (SELECT user_id, count(user_id)::int AS userFollowing FROM followers WHERE user_id=$1 GROUP BY user_id) c
      ON a.user_id = c.user_id
      `,
    [user_id]
  );

  if (!row)
    return Promise.reject({
      status: 404,
      msg: "User Not Found",
    });

  return row;
};

exports.updateUserById = async (
  user_id,
  username,
  name,
  email,
  profile_pic
) => {
  const currentUser = (await db.query("SELECT * FROM users WHERE user_id=1;"))
    .rows[0];

  const {
    rows: [row],
  } = await db.query(
    `UPDATE users SET username=$1,name=$2,email=$3,profile_pic=$4 WHERE user_id=$5 RETURNING *;`,
    [
      username ?? currentUser.username,
      name ?? currentUser.name,
      email ?? currentUser.email,
      profile_pic ?? currentUser.profile_pic,
      user_id,
    ]
  );

  if (!row)
    return Promise.reject({
      status: 404,
      msg: "User Not Found",
    });

  delete row.hash;

  return row;
};

exports.removeUserById = async (user_id) => {
  const {
    rows: [row],
  } = await db.query("DELETE FROM users WHERE user_id=$1 RETURNING *;", [
    user_id,
  ]);

  if (!row) return Promise.reject({ status: 404, msg: "User Not Found" });

  return row;
};

exports.selectPostsByUserId = async (user_id, movie_id, limit, page) => {
  const filterBymovie = format(`AND b.movie_id=%L`, movie_id);

  page = (page - 1) * limit;

  if (isNaN(parseInt(limit)) || parseInt(limit) > 100) {
    return Promise.reject({ status: 400, msg: "Invalid limit" });
  }

  const { rows } = await db.query(
    `
  SELECT COALESCE(likes, 0) 
  AS likes,
  COALESCE(comment_count, 0) 
  AS comment_count,
  profile_pic, rating,
  author, created_at, b.user_id, movie_title, b.movie_id, released, movie_poster, body, post_id, media_type
  FROM
  (SELECT post, count(post)::int AS likes FROM post_likes GROUP BY post) a
  FULL OUTER JOIN (SELECT * FROM posts) b
  ON a.post = b.post_id 
  FULL OUTER JOIN (SELECT post, count(post)::int AS comment_count FROM comments GROUP BY post) d
  ON b.post_id = d.post
  LEFT JOIN (SELECT user_id, profile_pic FROM users) e
  ON b.user_id = e.user_id
  LEFT JOIN (SELECT user_id, movie_id, rating FROM ratings) f
  ON b.user_id = f.user_id
  AND b.movie_id = f.movie_id
  WHERE b.user_id = $1
  ${movie_id ? filterBymovie : ""}
  ORDER BY created_at DESC
  LIMIT $2
  OFFSET $3
  `,
    [user_id, limit, page]
  );

  if (!rows) return Promise.reject({ status: 404, msg: "User Not Found" });

  return rows;
};

exports.selectActivityById = async (user_id) => {
  const watched = (
    await db.query(
      `SELECT * FROM watched WHERE user_id=$1
      `,
      [user_id]
    )
  ).rows;

  const post_likes = (
    await db.query(
      `SELECT like_id, post_likes.user_id, post, post_likes.created_at, post_likes.type, author, movie_title, released, movie_poster, body, posts.movie_id, posts.media_type, posts.user_id AS author_id
      FROM post_likes LEFT JOIN posts ON post_likes.post = posts.post_id 
       WHERE post_likes.user_id=$1
      `,
      [user_id]
    )
  ).rows;

  const comments = (
    await db.query(
      `SELECT 
      posts.user_id AS author_id,
      comments.author AS comment_author,
      posts.author AS post_author,
      comment_id, comments.user_id, post, comments.created_at, comments.type, movie_title, released, movie_poster, comments.body, posts.media_type
      FROM comments LEFT JOIN posts ON comments.post = posts.post_id 
       WHERE comments.user_id=$1
      `,
      [user_id]
    )
  ).rows;

  const ratings = (
    await db.query(
      `SELECT * FROM ratings
      WHERE user_id=$1
      `,
      [user_id]
    )
  ).rows;

  result = watched.concat(post_likes).concat(comments).concat(ratings);

  result.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

  if (!watched && !post_likes && !comments && !ratings)
    result = [{ msg: "No activity yet!" }];

  return result;
};

exports.selectFollowerActivityById = async (user_id) => {
  const watched = (
    await db.query(
      `SELECT * FROM 
      watched
      LEFT JOIN (SELECT following FROM followers WHERE user_id=$1) c
      ON watched.user_id = c.following
      WHERE following IS NOT NULL`,
      [user_id]
    )
  ).rows;

  const post_likes = (
    await db.query(
      `SELECT * FROM 
      post_likes
      LEFT JOIN (SELECT following FROM followers WHERE user_id=$1) c
      ON post_likes.user_id = c.following
      WHERE following IS NOT NULL`,
      [user_id]
    )
  ).rows;
  const comments = (
    await db.query(
      `SELECT * FROM 
      comments
      LEFT JOIN (SELECT following FROM followers WHERE user_id=$1) c
      ON comments.user_id = c.following
      WHERE following IS NOT NULL`,
      [user_id]
    )
  ).rows;
  const ratings = (
    await db.query(
      `SELECT * FROM 
      ratings
      LEFT JOIN (SELECT following FROM followers WHERE user_id=$1) c
      ON ratings.user_id = c.following
      WHERE following IS NOT NULL`,
      [user_id]
    )
  ).rows;

  result = watched.concat(post_likes).concat(comments).concat(ratings);
  result.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

  if (!watched && !post_likes && !comments && !ratings)
    result = [{ msg: "No activity yet!" }];
  return result;
};
