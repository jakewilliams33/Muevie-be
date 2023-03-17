const {
  selectRatingsById,
  insertRatingById,
  removeRatingById,
  updateRatingById,
  selectRatingsByUserId,
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

exports.getRatingsByUserId = (req, res) => {
  const { user_id } = req.params;
  const { movie_id } = req.query;
  selectRatingsByUserId(user_id, movie_id).then((ratings) => {
    if (movie_id) {
      if (ratings.length > 0) {
        res.status(200).send({ response: true, rating: ratings[0] });
      } else {
        res.status(200).send({ response: false, rating: {} });
      }
    } else {
      if (ratings.length > 0) {
        res.status(200).send({ response: true, ratings: ratings });
      } else {
        res.status(200).send({ response: false, ratings: [] });
      }
    }
  });
};
