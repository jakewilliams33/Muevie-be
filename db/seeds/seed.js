const format = require("pg-format");
const db = require("../connection");

const seed = async ({
  usersData,
  postsData,
  ratingsData,
  favouritesData,
  commentsData,
  watchedData,
  postLikesData,
  followersData,
  genresData,
}) => {
  await db.query(`DROP TABLE IF EXISTS genres;`);
  await db.query(`DROP TABLE IF EXISTS followers;`);
  await db.query(`DROP TABLE IF EXISTS post_likes;`);
  await db.query(`DROP TABLE IF EXISTS comments;`);
  await db.query(`DROP TABLE IF EXISTS watched;`);
  await db.query(`DROP TABLE IF EXISTS favourites;`);
  await db.query(`DROP TABLE IF EXISTS ratings;`);
  await db.query(`DROP TABLE IF EXISTS posts;`);
  await db.query(`DROP TABLE IF EXISTS users;`);

  await db.query(`CREATE TABLE users (
    username VARCHAR NOT NULL UNIQUE,
    user_id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    profile_pic VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    hash VARCHAR NOT NULL
  );`);

  await db.query(`CREATE TABLE posts (
    post_id SERIAL PRIMARY KEY,
    author VARCHAR REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    movie_title VARCHAR,
    movie_id VARCHAR,
    released VARCHAR,
    movie_poster VARCHAR,
    body VARCHAR,
    type VARCHAR DEFAULT 'post',
    media_type VARCHAR
    );`);

  await db.query(`CREATE TABLE ratings (
    rating_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    movie_id VARCHAR,
    rating INT,
    created_at TIMESTAMP DEFAULT NOW(),
    movie_poster VARCHAR,
    movie_title VARCHAR,
    type VARCHAR DEFAULT 'rating'
    );`);

  await db.query(`CREATE TABLE favourites (
    favourite_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    movie_id VARCHAR,
    movie_poster VARCHAR,
    movie_title VARCHAR,
    created_at TIMESTAMP DEFAULT NOW()
    );`);

  await db.query(`CREATE TABLE watched (
    watched_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    movie_id VARCHAR,
    movie_poster VARCHAR,
    movie_title VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    type VARCHAR DEFAULT 'watched'

    );`);

  await db.query(`CREATE TABLE comments (
        user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        comment_id SERIAL PRIMARY KEY,
        post INT NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
        author VARCHAR REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE,
        body VARCHAR NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        type VARCHAR DEFAULT 'comment'
        );`);

  await db.query(`CREATE TABLE post_likes (
        like_id SERIAL,
        user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        post INT NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        type VARCHAR DEFAULT 'post_like'
        );`);

  await db.query(`CREATE TABLE followers (
        user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        following INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW()
        );`);

  await db.query(`CREATE TABLE genres (
        post INT NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
        genre VARCHAR
        )`);

  const userQueryStr = format(
    "INSERT INTO users (username, name, email, profile_pic, hash) VALUES %L RETURNING *;",
    usersData.map(({ username, name, email, profile_pic, hash }) => [
      username,
      name,
      email,
      profile_pic,
      hash,
    ])
  );

  const postQueryStr = format(
    "INSERT INTO posts ( author, user_id, movie_title, movie_id, released, movie_poster, body, media_type) VALUES %L RETURNING *;",
    postsData.map(
      ({
        author,
        user_id,
        movie_title,
        movie_id,
        released,
        movie_poster,
        body,
        media_type,
      }) => [
        author,
        user_id,
        movie_title,
        movie_id,
        released,
        movie_poster,
        body,
        media_type,
      ]
    )
  );

  const ratingQueryStr = format(
    "INSERT INTO ratings ( user_id, movie_id, rating, movie_title, movie_poster) VALUES %L RETURNING *;",
    ratingsData.map(
      ({ user_id, movie_id, rating, movie_title, movie_poster }) => [
        user_id,
        movie_id,
        rating,
        movie_title,
        movie_poster,
      ]
    )
  );

  const favouriteQueryStr = format(
    "INSERT INTO favourites ( user_id, movie_id, movie_poster, movie_title) VALUES %L RETURNING *;",
    favouritesData.map(({ user_id, movie_id, movie_poster, movie_title }) => [
      user_id,
      movie_id,
      movie_poster,
      movie_title,
    ])
  );

  const watchedQueryStr = format(
    "INSERT INTO watched ( user_id, movie_id, movie_poster, movie_title) VALUES %L RETURNING *;",
    watchedData.map(({ user_id, movie_id, movie_poster, movie_title }) => [
      user_id,
      movie_id,
      movie_poster,
      movie_title,
    ])
  );

  const commentQueryStr = format(
    "INSERT INTO comments ( user_id, post, author, body ) VALUES %L RETURNING *;",
    commentsData.map(({ user_id, post, author, body }) => [
      user_id,
      post,
      author,
      body,
    ])
  );

  const postLikesQueryStr = format(
    "INSERT INTO post_likes ( user_id, post) VALUES %L RETURNING *;",
    postLikesData.map(({ user_id, post }) => [user_id, post])
  );

  const followersQueryStr = format(
    "INSERT INTO followers ( user_id, following) VALUES %L RETURNING *;",
    followersData.map(({ user_id, following }) => [user_id, following])
  );

  const genresQueryStr = format(
    "INSERT INTO genres ( post, genre) VALUES %L RETURNING *;",
    genresData.map(({ post, genre }) => [post, genre])
  );

  await db.query(userQueryStr).then((result) => result.rows);
  await db.query(postQueryStr).then((result) => result.rows);

  return Promise.all([
    db.query(ratingQueryStr).then((result) => result.rows),
    db.query(favouriteQueryStr).then((result) => result.rows),
    db.query(watchedQueryStr).then((result) => result.rows),
    db.query(commentQueryStr).then((result) => result.rows),
    db.query(postLikesQueryStr).then((result) => result.rows),
    db.query(followersQueryStr).then((result) => result.rows),
    db.query(genresQueryStr).then((result) => result.rows),
  ]);
};

module.exports = seed;
