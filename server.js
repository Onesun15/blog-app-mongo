'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const morgan = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { basicStrategy, jwtStrategy } = require('./auth/strategies');

const app = express();
const { router: usersRouter } = require('./routers/usersRouter');
const { router: blogpostRouter } = require('./routers/blogPostsRouter');
const { router: apiRouter } = require('./routers/apiRouter');
const { PORT, DATABASE_URL } = require('./config');

mongoose.Promise = global.Promise;

passport.use(basicStrategy);
passport.use(jwtStrategy);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cors());
app.use('/users', usersRouter);
app.use('/blog-posts', blogpostRouter);
app.use('/api', apiRouter);

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
