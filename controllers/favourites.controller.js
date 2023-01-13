const req = require("express/lib/request");
const {
  removeFavouriteById,
  selectFavouritesByUserId,
  insertFavouriteByUserId,
} = require("../models/favourites.model");
const { selectUserById } = require("../models/users.model");

exports.deleteFavouriteById = (req, res, next) => {
  const { favourite_id } = req.params;

  removeFavouriteById(favourite_id)
    .then((favourite) => {
      res.status(204).send({ favourite });
    })
    .catch((err) => next(err));
};

exports.getFavouritesByUserId = (req, res, next) => {
  const { user_id } = req.params;
  const { order } = req.query;

  Promise.all([
    selectFavouritesByUserId(user_id, order),
    selectUserById(user_id),
  ])
    .then(([favourites]) => {
      res.status(200).send({ favourites });
    })
    .catch((err) => next(err));
};

exports.addFavouriteByUserId = (req, res, next) => {
  const { user_id } = req.params;
  const newFav = req.body;

  insertFavouriteByUserId(user_id, newFav)
    .then((favourite) => {
      res.status(201).send({ favourite });
    })
    .catch((err) => next(err));
};
