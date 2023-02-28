const {
  selectRatingsById,
  insertRatingById,
  removeRatingById,
  updateRatingById,
} = require("../models/ratings.model");

exports.getRatingsById = (req, res) => {
  const { movie_id } = req.params;

  selectRatingsById(movie_id).then((rating) => {
    res.send({ rating });
  });
};

exports.addRatingById = (req, res) => {
  const { movie_id, user_id } = req.params;
  const { rating, movie_title, movie_poster } = req.body;

  insertRatingById(movie_id, user_id, rating, movie_title, movie_poster).then(
    (rating) => {
      res.status(201).send({ rating });
    }
  );
};

exports.deleteRatingById = (req, res) => {
  const { movie_id, user_id } = req.params;

  removeRatingById(movie_id, user_id).then((rating) => {
    res.status(204).send({ rating });
  });
};

exports.patchRatingById = (req, res) => {
  const { movie_id, user_id } = req.params;
  const { rating } = req.body;

  updateRatingById(movie_id, user_id, rating).then((rating) => {
    res.status(200).send({ rating });
  });
};
