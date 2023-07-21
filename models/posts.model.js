const format = require("pg-format");
const db = require("../db/connection");
const { checkExists } = require("../db/seeds/utils");

exports.selectPosts = async (user_id, genre, limit, page) => {
  const validGenres = [
    "28",
    "12",
    "10759",
    "16",
    "35",
    "80",
    "99",
    "18",
    "10751",
    "10762",
    "14",
    "9648",
    "10763",
    "10764",
    "10765",
    "10766",
    "10767",
    "10768",
    "37",
    "36",
    "27",
    "10402",
    "9648",
    "10749",
    "878",
    "53",
    "10770",
    "10752",
  ];

  const genres = {
    28: "action",
    12: "adventure",
    10759: "action & adventure",
    16: "animation",
    35: "comedy",
    80: "crime",
    99: "documentary",
    18: "drama",
    10751: "family",
    10762: "kids",
    14: "fantasy",
    9648: "mystery",
    10763: "news",
    10764: "reality",
    10765: "sci-fi & fantasy",
    10766: "soap",
    10767: "talk",
    10768: "war & politics",
    37: "western",
    36: "history",
    27: "horror",
    10402: "music",
    9648: "mystery",
    10749: "romance",
    878: "science fiction",
    53: "thriller",
    10770: "tv movie",
    10752: "war",
  };

  page = (page - 1) * limit;

  if (genre && !validGenres.includes(genre)) {
    return Promise.reject({
      status: 400,
      msg: "Invalid genre",
    });
  }

  if (isNaN(parseInt(limit)) || parseInt(limit) > 100) {
    return Promise.reject({ status: 400, msg: "Invalid limit" });
  }

  const filterByGenre = genre
    ? format(
        `RIGHT JOIN (SELECT * FROM genres WHERE genre_id=%L) g
  ON b.post_id = g.post`,
        genre
      )
    : ``;

  const filterByFollowers = user_id
    ? format(
        `FULL OUTER JOIN (SELECT following FROM followers WHERE user_id=%L) c
  ON b.user_id = c.following
  WHERE following IS NOT NULL
  OR b.user_id=%L`,
        user_id,
        user_id
      )
    : ``;

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
  ${filterByFollowers}
  ${filterByGenre}
  ORDER BY created_at DESC
  LIMIT $1
  OFFSET $2
  `,
    [limit, page]
  );

  return rows;
};

exports.insertPost = async ({
  author,
  user_id,
  movie_title,
  movie_id,
  movie_poster,
  body,
  released,
  media_type,
}) => {
  if (!author || !user_id || !movie_title || !body || !movie_id) {
    return Promise.reject({ status: 400, msg: "missing required fields" });
  }

  const {
    rows: [row],
  } = await db.query(
    "INSERT INTO posts (author, user_id, movie_title, movie_id, released, movie_poster, body, media_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;",
    [
      author,
      user_id,
      movie_title,
      movie_id,
      released,
      movie_poster,
      body,
      media_type,
    ]
  );

  row.likes = 0;

  return row;
};

exports.removePostById = async (post_id) => {
  const {
    rows: [row],
  } = await db.query("DELETE FROM posts WHERE post_id=$1 RETURNING *;", [
    post_id,
  ]);

  if (!row) return Promise.reject({ status: 404, msg: "ID Not Found" });

  return row;
};

exports.selectPostById = async (post_id) => {
  if (post_id) await checkExists("posts", "post_id", post_id);

  const {
    rows: [row],
  } = await db.query(
    `SELECT COALESCE(likes, 0) AS likes,
     COALESCE(comment_count, 0) 
     AS comment_count,
     author, created_at, user_id, movie_title, movie_id, released, movie_poster, body, post_id, media_type FROM 
     (SELECT * FROM posts WHERE post_id=$1) a
     LEFT JOIN (SELECT post, count(post)::int AS likes FROM post_likes WHERE post=$1 GROUP BY post) b
     ON a.post_id = b.post
     LEFT JOIN (SELECT post, count(post)::int AS comment_count FROM comments GROUP BY post) c
     ON a.post_id = c.post
  `,
    [post_id]
  );

  const genres = (
    await db.query(
      `
  SELECT * FROM genres WHERE post=$1`,
      [post_id]
    )
  ).rows;

  row.genres = genres.map((val) => val.genre_id);

  return row;
};

exports.updatePostById = async (body, post_id) => {
  const {
    rows: [row],
  } = await db.query(`UPDATE posts SET body=$1 WHERE post_id=$2 RETURNING *;`, [
    body,
    post_id,
  ]);
  if (!row)
    return Promise.reject({
      status: 404,
      msg: "Post Not Found",
    });

  return row;
};

exports.selectPostsByImdbId = async (movie_id, limit, page) => {
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
  WHERE b.movie_id=$1
  ORDER BY created_at DESC
  LIMIT $2
  OFFSET $3
  `,
    [movie_id, limit, page]
  );

  return rows;
};
