'use strict';

require('dotenv').config();
const express = require('express');
const router = express.Router();
const passport = require('passport');

const jwt = require('jsonwebtoken');
const config = require('../config');

const { Blog, User } = require('../models');
const { basicStrategy, jwtStrategy } = require('../auth/strategies');

router.use(passport.initialize());
const basicAuth = passport.authenticate('basic', {
  session: false,
  failWithError: true
});
const jwtAuth = passport.authenticate('jwt', {
  session: false,
  failWithError: true
});

const createAuthToken = function(user) {
  return jwt.sign({ user }, config.JWT_SECRET, {
    subject: user.username,
    expiresIn: config.JWT_EXPIRY
    // algorithm: 'HS256'
  });
};

/***************************\ New User Validation /***************************/

router.post('/users', (req, res) => {
  const requiredFields = ['username', 'password', 'firstName', 'lastName'];
  requiredFields.forEach(field => {
    if (!(field in req.body)) {
      const message = `You are missing required field: ${field}`;
      console.log(message);
      return res.status(400).send(message);
    }
  });
  let { username, password, firstName, lastName } = req.body;

  if (!req.body) {
    return res.status(400).json({ message: 'No request body' });
  }

  if (!('username' in req.body)) {
    return res.status(422).json({ message: 'Missing field: username' });
  }

  if (typeof username !== 'string') {
    return res.status(422).json({ message: 'Incorrect field type: username' });
  }

  username = username.trim();

  if (username === '') {
    return res
      .status(422)
      .json({ message: 'Incorrect field length: username' });
  }

  if (!password) {
    return res.status(422).json({ message: 'Missing field: password' });
  }

  if (typeof password !== 'string') {
    return res.status(422).json({ message: 'Incorrect field type: password' });
  }

  password = password.trim();

  if (password === '') {
    return res
      .status(422)
      .json({ message: 'Incorrect field length: password' });
  }

  return User.find({ username })
    .count()
    .then(count => {
      if (count > 0) {
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Username already taken',
          location: 'username'
        });
      }
      return User.hashPassword(password);
    })
    .then(hash => {
      return User.create({
        username,
        password: hash,
        firstName,
        lastName
      });
    })
    .then(user => {
      return res.status(201).json(user.apiRepr());
    })
    .catch(err => {
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({ code: 500, message: 'Internal server error' });
    });
});

/***************************\ GET POST & USERS /***************************/

router.get('/', (req, res) => {
  User.find()
    .then(users => {
      res.json(users.map(user => user.apiRepr()));
    })
    .catch(error => {
      console.error(error);
      res.status(500).json(error);
    });
});

module.exports = { router };

function logTokenDate(token) {
  const decoded = jwt.verify(token, config.JWT_SECRET);
  let d = new Date(0);
  d.setUTCSeconds(decoded.exp);
  console.log(d.toLocaleString());
}
