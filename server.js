'use strict';

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

//const {router: usersRouter} = require('./users');

const app = express();
const mongooseRouter = require('./blogPostsRouter');
const { PORT, DATABASE_URL } = require('./config');

mongoose.Promise = global.Promise;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use('/blog-posts', mongooseRouter);

app.get('/', (req, res) => res.send('Hello World!!!!!'));

let server;
function runServer(databaseUrl = DATABASE_URL, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app
        .listen(port, () => {
          console.log(`Your app is listening on port ${port}`);
          resolve();
        })
        .on('error', error => {
          mongoose.disconnect();
          reject(error);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(error => {
        if (error) {
          return reject(error);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer().catch(error => console.error(error));
}

module.exports = { app, runServer, closeServer };
