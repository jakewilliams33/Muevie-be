const req = require("express/lib/request");

const {
  insertUser,
  checkUser,
  checkUserNameFree,
} = require("../models/registerLogin.model");

exports.postUser = (req, res, next) => {
  insertUser(req.body)
    .then((user) => {
      res.status(201).send({ user });
    })
    .catch((err) => next(err));
};

exports.verifyUser = (req, res, next) => {
  checkUser(req.body)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => next(err));
};

exports.verifyUserNameFree = (req, res, next) => {
  checkUserNameFree(req.body)
    .then((usernameFree) => {
      res.status(200).send({ usernameFree });
    })
    .catch((err) => next(err));
};
