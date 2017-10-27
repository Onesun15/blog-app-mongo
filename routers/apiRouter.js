'use strict';

require('dotenv').config();
const express = require('express');
const router = express.Router();
const passport = require('passport');

const jwt = require('jsonwebtoken');
const config = require('../config');

const { Blog, User } = require('../models');
const { basicStrategy, jwtStrategy } = require('../auth/strategies');

passport.use(basicStrategy);
passport.use(jwtStrategy);
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

/***************************\ LOGIN A POST /***************************/

router.post('/login', basicAuth, (req, res) => {
  const authToken = createAuthToken(req.user.apiRepr());
  logTokenDate(authToken);
  res.json({ authToken });
});

router.post('/refresh', jwtAuth, (req, res) => {
  const authToken = createAuthToken(req.user);
  res.json({ authToken });
});

module.exports = { router };

function logTokenDate(token) {
  const decoded = jwt.verify(token, config.JWT_SECRET);
  let d = new Date(0);
  d.setUTCSeconds(decoded.exp);
  console.log(d.toLocaleString());
}
