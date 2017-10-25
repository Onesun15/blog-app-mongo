'use strict';

const express = require('express');
const router = express.Router();

const { Blog } = require('./models');

/***************************\ GET A POST /***************************/

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

router.post('/', (req, res) => {
  const requiredFields = ['title', 'content', 'author'];
  requiredFields.forEach(field => {
    if (!(field in req.body)) {
      const message = `You are missing required field: ${field}`;
      console.log(message);
      return res.status(400).send(message);
    }
  });
  const { title, content } = req.body;
  const { firstName, lastName } = req.body.author;
  Blog.create({
    title,
    content,
    author: {
      firstName,
      lastName
    }
  })
    .then(post => {
      //res.status(201).json(post.apiRepr());
      res.location(`${post._id}`).status(201).json(post.apiRepr());
    })
    .catch(error => {
      console.error(error);
      res.status(500).json(error);
    });
});

/***************************\ UPDATE A POST /***************************/

router.put('/:id', (req, res) => {
  //console.log(req.body);
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

router.delete('/:id', (req, res) => {
  Blog.findByIdAndRemove(req.params.id).then(() => {
    res.status(204).end();
  });
});
module.exports = router;
