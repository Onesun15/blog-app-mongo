'use strict';

const express = require('express');
const router = express.Router();
const { BasicStrategy } = require('passport-http');
const passport = require('passport');

const { Blog, User } = require('./models');

/***************************\ Validation Strategy /***************************/

const basicStrategy = new BasicStrategy(function(username, password, done) {
  let user;
  User.findOne({ username: username })
    .then(_user => {
      user = _user;
      if (!user) {
        return done(null, false);
      }
      return user.validatePassword(password);
    })
    .then(isValid => {
      if (!isValid) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    })
    .catch(err => done(err));
});

passport.use(basicStrategy);
router.use(passport.initialize());
const authenticate = passport.authenticate('basic', { session: false });

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
        username: username,
        password: hash,
        firstName: firstName,
        lastName: lastName
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

router.get('/users', (req, res) => {
  User.find()
    .then(users => {
      res.json(users.map(user => user.apiRepr()));
    })
    .catch(error => {
      console.error(error);
      res.status(500).json(error);
    });
});

router.get('/', (req, res) => {
  Blog.find()
    .then(posts => {
      res.json(posts.map(post => post.apiRepr()));
    })
    .catch(error => {
      console.error(error);
      res.status(500).json(error);
    });
});

/***************************\ GET A POST BY ID /***************************/

router.get('/:id', (req, res) => {
  Blog.findById(req.params.id)
    .then(post => {
      res.json(post.apiRepr());
    })
    .catch(error => {
      console.error(error);
      res.status(500).json(error);
    });
});

/***************************\ CREATE A POST /***************************/

router.post('/', authenticate, (req, res) => {
  const requiredFields = ['title', 'content', 'author'];
  requiredFields.forEach(field => {
    if (!(field in req.body)) {
      const message = `You are missing required field: ${field}`;
      console.log(message);
      return res.status(400).send(message);
    }
  });
  const { title, content } = req.body;
  const { firstName, lastName } = req.user;
  Blog.create({
    title,
    content,
    author: {
      firstName,
      lastName
    }
  })
    .then(post => {
      res
        .location(`${post._id}`)
        .status(201)
        .json(post.apiRepr());
    })
    .catch(error => {
      console.error(error);
      res.status(500).json(error);
    });
});

/***************************\ UPDATE A POST /***************************/

router.put('/:id', authenticate, (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }
  const updated = {};
  const updateableFields = ['title', 'content', 'author'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });
  Blog.findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
    .then(updated => {
      res.status(204).json(updated.apiRepr());
    })
    .catch(error => {
      console.error(error);
      res.status(500).json(error);
    });
});

/***************************\ DELETE A POST /***************************/

router.delete('/:id', authenticate, (req, res) => {
  Blog.findByIdAndRemove(req.params.id).then(() => {
    res.status(204).end();
  });
});

module.exports = router;
