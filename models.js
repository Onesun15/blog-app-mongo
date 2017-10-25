'use strict';

const mongoose = require('mongoose');

const blogSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: {
    firstName: String,
    lastName: String
  },
  created: {type: Date, default: Date.now}
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

module.exports = { Blog };
