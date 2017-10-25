'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const should = chai.should();

const { Blog } = require('../models');
const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');

chai.use(chaiHttp);

function seedBlogData() {
  const seedData = [];

  for (let i = 1; i <= 10; i++) {
    seedData.push({
      title: faker.lorem.sentence(),
      content: faker.lorem.text(),
      author: {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName()
      }
    });
  }
  return Blog.insertMany(seedData);
}

function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('Blog API resource', function() {
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedBlogData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  describe('GET endpoint', function() {
    it('should return all existing blog posts', function() {
      let res;
      return chai
        .request(app)
        .get('/blog-posts')
        .then(function(_res) {
          res = _res;
          res.should.have.status(200);
          res.body.should.have.length.of.at.least(1);
          return Blog.count();
        })
        .then(function(count) {
          res.body.should.have.lengthOf(count);
        });
    });
  });
  it('should return blogs with right fields', function() {
    let resBlog;
    return chai
      .request(app)
      .get('/blog-posts')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        res.body.should.have.length.of.at.least(1);

        res.body.forEach(function(post) {
          post.should.be.a('object');
          post.should.include.keys('id', 'author', 'title', 'created');
        });
        resBlog = res.body[0];
        return Blog.findById(resBlog.id);
      })
      .then(function(blogPost) {
        const fullName = `${blogPost.author.firstName} ${blogPost.author
          .lastName}`;
        resBlog.id.should.equal(blogPost.id);
        resBlog.author.should.equal(fullName);
        resBlog.title.should.equal(blogPost.title);
      });
  });

  describe('POST endpoint', function() {
    it('should add a new blog post', function() {});
    const testPost = {
      title: faker.lorem.sentence(),
      content: faker.lorem.text(),
      author: {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName()
      }
    };
    return chai
      .request(app)
      .post('/blog-posts')
      .send(testPost)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.include.keys(
          'id',
          'title',
          'content',
          'author',
          'created'
        );
        res.body.title.should.equal(testPost.title);
        res.body.id.should.not.be.null;
        const fullName = `${testPost.author.firstName} ${testPost.author
          .lastName}`;
        res.body.author.should.equal(fullName);
        res.body.content.should.equal(testPost.content);
        return Blog.findById(res.body.id);
      })
      .then(function(post) {
        post.title.should.equal(testPost.title);
        post.content.should.equal(testPost.content);
        post.author.firstName.should.equal(testPost.author.firstName);
        post.author.lastName.should.equal(testPost.author.lastName);
      });
  });

  describe('PUT endpoint', function() {
    it('should update fields you send over', function() {
      const updateData = {
        title: 'New Title',
        content: 'some new content',
        author: {
          firstName: 'New',
          lastName: 'Name'
        }
      };
      return Blog.findOne()
        .then(function(post) {
          updateData.id = post.id;
          return chai
            .request(app)
            .put(`/blog-posts/${post.id}`)
            .send(updateData);
        })
        .then(function(res) {
          res.should.have.status(204);
          return Blog.findById(updateData.id);
        })
        .then(function(post) {
          post.title.should.equal(updateData.title);
          post.content.should.equal(updateData.content);
          post.author.firstName.should.equal(updateData.author.firstName);
          post.author.lastName.should.equal(updateData.author.lastName);
        });
    });
  });

  describe('DELETE endpoint', function() {
    it('should delete a post by id', function() {
      let post;

      return Blog.findOne()
        .then(function(_post) {
          post = _post;
          return chai.request(app).delete(`/blog-posts/${post.id}`);
        })
        .then(function(res) {
          res.should.have.status(204);
          return Blog.findById(post.id);
        })
        .then(function(_post) {
          should.not.exist(_post);
        });
    });
  });
});
