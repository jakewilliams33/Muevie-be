const {
  updateCommentById,
  removeCommentById,
  selectCommentsByPostId,
  insertCommentByPostId,
} = require("../models/comments.model");

exports.patchCommentById = (req, res) => {
  const { comment_id } = req.params;
  const { body } = req.body;

  updateCommentById(body, comment_id).then((comment) => {
    res.status(200).send({ comment });
  });
};

exports.getCommentsByPostId = (req, res, next) => {
  const { post_id } = req.params;

  selectCommentsByPostId(post_id)
    .then((comments) => {
      res.send({ comments });
    })
    .catch(next);
};

exports.addCommentsByPostId = (req, res, next) => {
  const { post_id } = req.params;
  const { author, body, user_id } = req.body;

  insertCommentByPostId(post_id, author, body, user_id)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

exports.deleteCommentById = (req, res) => {
  const { comment_id } = req.params;

  removeCommentById(comment_id).then((comment) => {
    res.status(204).send({ comment });
  });
};
