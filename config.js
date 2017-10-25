'use strict';

exports.DATABASE_URL = process.env.DATABASE_URL ||
global.DATABASE_URL ||
'mongodb://localhost/seed-data';
exports.TEST_DATABASE_URL = (
  process.env.TEST_DATABASE_URL ||
 'mongodb://localhost/test-blog-data');
exports.PORT = process.env.PORT || 8080;