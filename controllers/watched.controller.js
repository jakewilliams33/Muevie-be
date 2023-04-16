const {
  removeWatchedById,
  selectWatchedByUserId,
  insertWatchedByUserId,
} = require("../models/watched.model");

exports.deleteWatchedById = (req, res) => {
  const { user_id, movie_id } = req.params;

  removeWatchedById(user_id, movie_id).then((watched) => {
    res.status(204).send({ watched });
  });
};

exports.getWatchedByUserId = (req, res, next) => {
  const { user_id } = req.params;
  const { order } = req.query;
  selectWatchedByUserId(user_id, order)
    .then((watched) => {
      res.status(200).send({ watched });
    })
    .catch((err) => next(err));
};

exports.addWatchedByUserId = (req, res, next) => {
  const { user_id } = req.params;
  const newWatched = req.body;

  insertWatchedByUserId(user_id, newWatched, next).then((watched) => {
    res.status(201).send({ watched });
  });
};
