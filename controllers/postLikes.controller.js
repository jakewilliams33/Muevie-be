const {
  insertPostLike,
  removePostLike,
  selectLikesByPostId,
} = require("../models/postLikes.model");

exports.addPostLike = (req, res) => {
  const { post_id, user_id } = req.body;

  insertPostLike(user_id, post_id).then((like) => {
    res.status(201).send({ like });
  });
};

exports.deletePostLike = (req, res) => {
  const { post_id, user_id } = req.body;

  removePostLike(user_id, post_id).then((like) => {
    res.status(204).send({ like });
  });
};

exports.getLikesByPostId = (req, res) => {
  const { post_id } = req.params;

  selectLikesByPostId(post_id).then((users) => {
    res.status(200).send({ users });
  });
};