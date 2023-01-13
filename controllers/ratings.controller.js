const {
  selectRatingsById,
  insertRatingById,
  removeRatingById,
  updateRatingById,
} = require("../models/ratings.model");

exports.getRatingsById = (req, res) => {
  const { imdb_id } = req.params;

  selectRatingsById(imdb_id).then((rating) => {
    res.send({ rating });
  });
};

exports.addRatingById = (req, res) => {
  const { imdb_id, user_id } = req.params;
  const { rating } = req.body;

  insertRatingById(imdb_id, user_id, rating).then((rating) => {
    res.status(201).send({ rating });
  });
};

exports.deleteRatingById = (req, res) => {
  const { imdb_id, user_id } = req.params;

  removeRatingById(imdb_id, user_id).then((rating) => {
    res.status(204).send({ rating });
  });
};

exports.patchRatingById = (req, res) => {
  const { imdb_id, user_id } = req.params;
  const { rating } = req.body;

  updateRatingById(imdb_id, user_id, rating).then((rating) => {
    res.status(200).send({ rating });
  });
};
