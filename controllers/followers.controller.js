const {
  selectFollowingByUserId,
  insertFollowing,
  removeFollowing,
} = require("../models/followers.model");

exports.getFollowingByUserId = (req, res, next) => {
  const { user_id } = req.params;
  const { order } = req.query;

  selectFollowingByUserId(user_id, order)
    .then((followData) => {
      res.send({ followData });
    })
    .catch((err) => next(err));
};

exports.addFollowing = (req, res) => {
  const { following } = req.body;
  const { user_id } = req.params;
  insertFollowing(user_id, following).then((following) => {
    res.status(201).send({ following });
  });
};

exports.deleteFollowing = (req, res) => {
  const { user_id, following } = req.params;

  removeFollowing(user_id, following).then((following) => {
    res.status(204).send({ following });
  });
};
