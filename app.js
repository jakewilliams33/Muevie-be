const express = require("express");
const app = express();
const cors = require("cors");

const {
  postUser,
  verifyUser,
  verifyUserNameFree,
} = require("./controllers/registerLogin.controller");

const {
  getUsers,
  getUserById,
  patchUserById,
  deleteUserById,
  getPostsByUserId,
  getActivityById,
  getFollowerActivityById,
} = require("./controllers/users.controller");
const {
  getPosts,
  addPost,
  deletePostById,
  getPostById,
  patchPostById,
  getPostsByImdbId,
} = require("./controllers/posts.controller");
const {
  deleteFavouriteById,
  getFavouritesByUserId,
  addFavouriteByUserId,
} = require("./controllers/favourites.controller");
const {
  deleteWatchedById,
  getWatchedByUserId,
  addWatchedByUserId,
} = require("./controllers/watched.controller");
const {
  getFollowingByUserId,
  addFollowing,
  deleteFollowing,
} = require("./controllers/followers.controller");
const {
  patchCommentById,
  getCommentsByPostId,
  addCommentsByPostId,
  deleteCommentById,
} = require("./controllers/comments.controller");
const {
  addPostLike,
  deletePostLike,
  getLikesByPostId,
  getLikesByUserId,
} = require("./controllers/postLikes.controller");
const {
  getRatingsById,
  addRatingById,
  deleteRatingById,
  patchRatingById,
  getRatingsByUserId,
} = require("./controllers/ratings.controller");
const {
  getGenresById,
  addGenresById,
  deleteGenre,
} = require("./controllers/genres.controller");
const {
  badRequest,
  customErrors,
  sqlForeignKeyConstraint,
  psqlErrors,
  sqlDuplicateKey,
} = require("./server.errors");

app.use(express.json());
app.use(cors({ origin: true }));

app.get("/api/users", getUsers);

app.post("/api/register", postUser);
app.post("/api/login", verifyUser);
app.post("/api/checkusername", verifyUserNameFree);

app.get("/api/users/:user_id", getUserById);
app.patch("/api/users/:user_id", patchUserById);
app.delete("/api/users/:user_id", deleteUserById);

app.post("/api/users/:user_id/favourites", addFavouriteByUserId);
app.get("/api/users/:user_id/favourites", getFavouritesByUserId);
app.delete("/api/favourites/:favourite_id", deleteFavouriteById);

app.post("/api/users/:user_id/watched", addWatchedByUserId);
app.get("/api/users/:user_id/watched", getWatchedByUserId);
app.delete("/api/watched/:watched_id", deleteWatchedById);

app.get("/api/posts", getPosts);
app.post("/api/posts", addPost);
app.get("/api/posts/:post_id", getPostById);
app.delete("/api/posts/:post_id", deletePostById);
app.patch("/api/posts/:post_id", patchPostById);

app.get("/api/posts/:post_id/comments", getCommentsByPostId);
app.post("/api/posts/:post_id/comments", addCommentsByPostId);

app.patch("/api/comments/:comment_id", patchCommentById);
app.delete("/api/comments/:comment_id", deleteCommentById);

app.get("/api/users/:user_id/followers", getFollowingByUserId);
app.post("/api/users/:user_id/followers", addFollowing);
app.delete("/api/users/:user_id/followers", deleteFollowing);

app.post("/api/post_likes", addPostLike);
app.delete("/api/users/:user_id/post_likes/:post_id", deletePostLike);
app.get("/api/users/:user_id/post_likes", getLikesByUserId);

app.get("/api/users/:user_id/posts", getPostsByUserId);

app.get("/api/posts/:post_id/post_likes", getLikesByPostId);
app.get("/api/:movie_id/posts", getPostsByImdbId);

app.get("/api/ratings/:movie_id", getRatingsById);
app.get("/api/users/:user_id/ratings", getRatingsByUserId);
app.post("/api/users/:user_id/ratings/:movie_id", addRatingById);
app.delete("/api/users/:user_id/ratings/:movie_id", deleteRatingById);
app.patch("/api/users/:user_id/ratings/:movie_id", patchRatingById);

app.get("/api/posts/:post_id/genres", getGenresById);
app.post("/api/posts/:post_id/genres", addGenresById);
app.delete("/api/posts/:post_id/genres", deleteGenre);

app.get("/api/users/:user_id/activity", getActivityById);

app.get("/api/users/:user_id/follower_activity", getFollowerActivityById);

app.use(customErrors);

app.use(psqlErrors);

app.use(customErrors);

app.use(badRequest);

app.use(sqlForeignKeyConstraint);

app.use(sqlDuplicateKey);

app.use((err, req, res, next) => {
  console.log(err);
  res.sendStatus(500);
});

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  }
});

module.exports = app;
