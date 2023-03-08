const {
  selectPosts,
  insertPost,
  removePostById,
  selectPostById,
  updatePostById,
  selectPostsByImdbId,
} = require("../models/posts.model");

exports.getPosts = (req, res, next) => {
  const { user_id } = req.body;
  const { genre, limit = 10, page = 1 } = req.query;

  selectPosts(user_id, genre, limit, page)
    .then((posts) => {
      res.status(200).send({ posts });
    })
    .catch(next);
};

exports.addPost = (req, res, next) => {
  insertPost(req.body)
    .then((post) => {
      res.status(201).send({ post });
    })
    .catch(next);
};

exports.deletePostById = (req, res, next) => {
  const { post_id } = req.params;

  removePostById(post_id)
    .then((post) => {
      res.status(204).send({ post });
    })
    .catch(next);
};

exports.getPostById = (req, res, next) => {
  const { post_id } = req.params;
  selectPostById(post_id)
    .then((post) => {
      res.status(200).send({ post });
    })
    .catch(next);
};

exports.patchPostById = (req, res, next) => {
  const { post_id } = req.params;
  const { body } = req.body;

  updatePostById(body, post_id)
    .then((post) => {
      res.status(200).send({ post });
    })
    .catch(next);
};

exports.getPostsByImdbId = (req, res, next) => {
  const { movie_id } = req.params;

  selectPostsByImdbId(movie_id)
    .then((posts) => {
      res.status(200).send({ posts });
    })
    .catch(next);
};
