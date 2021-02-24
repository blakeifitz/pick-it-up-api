process.env.TZ = 'UCT';
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'pick-it-up-jwt-secret';
process.env.JWT_EXPIRY = '3m';

require('dotenv').config();

process.env.TEST_DB_URL =
  process.env.TEST_DB_URL ||
  'postgresql://blakefitzpatrick@localhost/pick-it-up-test';

const { expect } = require('chai');
const supertest = require('supertest');

global.expect = expect;
global.supertest = supertest;
