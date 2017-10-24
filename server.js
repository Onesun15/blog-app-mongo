'use strict';

const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const app = express();
const mongooseRouter = require('./blogPostsRouter');
//const { PORT } = require('./config');

app.use(morgan('common'));
app.use('/blog-posts', mongooseRouter);

app.use(bodyParser.json());

app.listen(process.env.PORT || 8080, () => {
  console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
});
