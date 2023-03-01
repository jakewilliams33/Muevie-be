const {
  selectUsers,
  selectUserById,
  updateUserById,
  removeUserById,
  selectPostsByUserId,
  selectActivityById,
  selectFollowerActivityById,
} = require("../models/users.model");

exports.getUsers = (req, res) => {
  selectUsers().then((users) => {
    res.send({ users });
  });
};

exports.getUserById = (req, res, next) => {
  const { user_id } = req.params;
  selectUserById(user_id)
    .then((user) => {
      res.status(200).send({ user });
    })
    .catch((err) => next(err));
};

exports.patchUserById = (req, res, next) => {
  const { user_id } = req.params;
  const { username, name, email, profile_pic } = req.body;

  updateUserById(user_id, username, name, email, profile_pic)
    .then((user) => {
      res.status(200).send({ user });
    })
    .catch((err) => next(err));
};

exports.deleteUserById = (req, res, next) => {
  const { user_id } = req.params;
  removeUserById(user_id)
    .then((user) => {
      res.status(204).send({ user });
    })
    .catch((err) => next(err));
};

exports.getPostsByUserId = (req, res, next) => {
  const { user_id } = req.params;
  selectPostsByUserId(user_id).then((posts) => {
    res.status(200).send({ posts });
  });
};

exports.getActivityById = (req, res, next) => {
  const { user_id } = req.params;
  selectActivityById(user_id).then((activity) => {
    res.status(200).send({ activity });
  });
};

exports.getFollowerActivityById = (req, res, next) => {
  const { user_id } = req.params;

  selectFollowerActivityById(user_id).then((activity) => {
    res.status(200).send({ activity });
  });
};
