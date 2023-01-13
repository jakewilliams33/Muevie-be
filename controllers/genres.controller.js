const {
  selectGenresById,
  insertGenresById,
  removeGenre,
} = require("../models/genres.model");

exports.getGenresById = (req, res) => {
  const { post_id } = req.params;

  selectGenresById(post_id).then((postGenres) => {
    res.status(200).send({ postGenres });
  });
};

exports.addGenresById = (req, res) => {
  const { post_id } = req.params;
  const { genres } = req.body;

  insertGenresById(post_id, genres).then((postGenres) => {
    res.status(201).send({ postGenres });
  });
};

exports.deleteGenre = (req, res) => {
  const { post_id } = req.params;
  const { genre } = req.body;

  removeGenre(post_id, genre).then((postGenre) => {
    res.status(204).send({ postGenre });
  });
};
