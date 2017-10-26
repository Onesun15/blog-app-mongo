'use strict';

require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const blogSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: {
    firstName: String,
    lastName: String
  },
  created: { type: Date, default: Date.now }
});

blogSchema.virtual('authorString').get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim();
});

blogSchema.methods.apiRepr = function() {
  return {
    id: this._id,
    author: this.authorString,
    title: this.title,
    created: this.created
  };
};

const Blog = mongoose.model('Blog', blogSchema);

mongoose.Promise = global.Promise;

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    require: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' }
});

UserSchema.methods.apiRepr = function() {
  return {
    username: this.username || '',
    firstName: this.firstName || '',
    lastName: this.lastName || ''
  };
};

UserSchema.methods.validatePassword = function(password) {
  return bcrypt
    .compare(password, this.password)
    .then(isValid => isValid);
};
  
UserSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10)
    .then(hash => hash);
};

const User = mongoose.model('User', UserSchema);

module.exports = { Blog, User };
