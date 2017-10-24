'use strict';

const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const mongoose = require('mongoose');

const {Blog} = require('./models');

mongoose.Promise = global.Promise;


// function lorem() {
//   return 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod ' +
//     'tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, ';
//   'quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo ' +
//     'consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse ' +
//     'cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non ' +
//     'proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
// }


router.get('/', (req, res) => {
  Blog
    .find()
    .then(posts => {
      res.json(posts.map(post => post.apiRepr()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'something went terribly wrong'});
    });
});

router.get('/:id', (req, res) => {
  Blog
    .findById(req.params.id)
    .then(post => {
      res.json(post.apiRepr());
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({error: 'something went horribly awry'});
    });
});

router.post('/', (req, res) => {
  const requiredFields = ['title', 'content', 'author'];
  console.log(requiredFields);
  requiredFields.forEach(field => {
    console.log(field, req.body);
    // if (!(field in req.body)) {
    //   const message = `You are missing required field: ${field}`;
    //   console.log(message);
    //   return res.status(400).send(message);
    //}
  });
  const {title, content, author} = req.body;
  Blog
    .create({
      title,
      content,
      author
    })
    .then(post => {
      res.status(201).json(post.apiRepr());
    });
});





// seed some posts so initial GET requests will return something
// BlogPosts.create(
//   '10 things -- you won\'t believe #4', lorem(), 'Billy Bob');
// BlogPosts.create(
//   'Lions and tigers and bears oh my', lorem(), 'Lefty Lil');


  
// add endpoint for GET. It should call `BlogPosts.get()`
// and return JSON objects of stored blog posts.
// send back JSON representation of all blog posts
// on GET requests to root


// add endpoint for POST requests, which should cause a new
// blog post to be added (using `BlogPosts.create()`). It should
// return a JSON object representing the new post (including
// the id, which `BlogPosts` will create. This endpoint should
// send a 400 error if the post doesn't contain
// `title`, `content`, and `author`


// add endpoint for PUT requests to update blogposts. it should
// call `BlogPosts.update()` and return the updated post.
// it should also ensure that the id in the object representing
// the post matches the id of the path variable, and that the
// following required fields are in request body: `id`, `title`,
// `content`, `author`, `publishDate`

// add endpoint for DELETE requests. These requests should
// have an id as a URL path variable and call
// `BlogPosts.delete()`

module.exports = router;
