const db = require("../db/connection");
const argon2 = require("argon2");

exports.selectUsers = async () => {
  const { rows } = await db.query(`SELECT * FROM users;`);
  return rows;
};

exports.insertUser = async ({
  username,
  name,
  email,
  profile_pic,
  password,
}) => {
  if (!username || !password || !email || !name)
    return Promise.reject({ status: 400, msg: "missing required fields" });

  const hash = await argon2.hash(password);

  const {
    rows: [row],
  } = await db.query(
    "INSERT INTO users (username, name, email, profile_pic, hash) VALUES ($1, $2, $3, $4, $5) RETURNING *;",
    [username, name, email, profile_pic, hash]
  );

  return row;
};

exports.selectUserById = async (user_id) => {
  const {
    rows: [row],
  } = await db.query(
    `
      SELECT username, a.user_id, name, email, profile_pic, created_at, hash, 
      COALESCE(userFollowing, 0) AS following, 
      COALESCE(userFollowers, 0) AS followers
      FROM (SELECT * FROM users WHERE user_id=$1) a
      LEFT JOIN
      (SELECT following, count(following)::int AS userFollowing FROM followers WHERE following=$1 GROUP BY following) b
      ON a.user_id = b.following
      LEFT JOIN
      (SELECT user_id, count(user_id)::int AS userFollowers FROM followers WHERE user_id=$1 GROUP BY user_id) c
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

exports.selectPostsByUserId = async (user_id) => {
  const { rows } = await db.query(
    `
  SELECT COALESCE(likes, 0) 
  AS likes,
  COALESCE(comment_count, 0) 
  AS comment_count,
  author, created_at, user_id, movie_title, imdb_id, released, movie_poster, body, post_id
  FROM
  (SELECT post, count(post)::int AS likes FROM post_likes GROUP BY post) a
  FULL OUTER JOIN (SELECT * FROM posts) b
  ON a.post = b.post_id 
  FULL OUTER JOIN (SELECT post, count(post)::int AS comment_count FROM comments GROUP BY post) d
  ON b.post_id = d.post
  WHERE user_id=$1
  ORDER BY created_at DESC
  `,
    [user_id]
  );

  if (!rows) return Promise.reject({ status: 404, msg: "User Not Found" });

  return rows;
};

exports.selectActivityById = async (user_id) => {
  const posts = (
    await db.query(
      `
  select * from
  (SELECT COALESCE(likes, 0) 
  AS likes,
  COALESCE(comment_count, 0) 
  AS comment_count,
  author, created_at, user_id, movie_title, imdb_id, released, movie_poster, body, post_id
  FROM
  (SELECT post, count(post)::int AS likes FROM post_likes GROUP BY post) a
  FULL OUTER JOIN (SELECT * FROM posts) b
  ON a.post = b.post_id 
  FULL OUTER JOIN (SELECT post, count(post)::int AS comment_count FROM comments GROUP BY post) d
  ON b.post_id = d.post
  WHERE user_id=$1
  ORDER BY created_at DESC) posts
  `,
      [user_id]
    )
  ).rows;

  const watched = (
    await db.query(
      `SELECT * FROM watched WHERE user_id=$1
      `,
      [user_id]
    )
  ).rows;

  const post_likes = (
    await db.query(
      `SELECT * FROM post_likes LEFT JOIN posts ON post_likes.post = posts.post_id 
       WHERE post_likes.user_id=$1
      `,
      [user_id]
    )
  ).rows;

  const comments = (
    await db.query(
      `SELECT * FROM comments WHERE user_id=$1
      `,
      [user_id]
    )
  ).rows;

  const ratings = (
    await db.query(
      `SELECT * FROM ratings WHERE user_id=$1
      `,
      [user_id]
    )
  ).rows;

  result = posts
    .concat(watched)
    .concat(post_likes)
    .concat(comments)
    .concat(ratings);

  result.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

  if (!posts && !watched && !post_likes && !comments && !ratings)
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
