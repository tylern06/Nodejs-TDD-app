const request = require('supertest');
const app = require('../src/app');
const User = require('../src/User/User');
const sequelize = require('../src/config/database');

beforeAll(function () {
  // initailize database before each test case
  return sequelize.sync();
});

beforeEach(function () {
  // clean User table before each test
  return User.destroy({ truncate: true });
});

describe('User Registration', () => {
  it('should return 200 when user sign up is valid', (done) => {
    // mock api request using supertest request
    request(app)
      .post('/api/1.0/users')
      .send({
        username: 'user1',
        email: 'user1@gmail.com',
        password: 'P4ssword',
      })
      .then((response) => {
        expect(response.status).toBe(200);
        // use done to wait for async request to complete
        done();
      });
  });
  it('return success message when sign up is valid', (done) => {
    // mock api request using supertest request
    request(app)
      .post('/api/1.0/users')
      .send({
        username: 'user1',
        email: 'user1@gmail.com',
        password: 'P4ssword',
      })
      .then((response) => {
        expect(response.body.message).toBe('User created');
        // use done to wait for async request to complete
        done();
      });
  });
  it('saves user to database', (done) => {
    // mock api request using supertest request
    // mock body message with user info to server
    request(app)
      .post('/api/1.0/users')
      .send({
        username: 'user1',
        email: 'user1@gmail.com',
        password: 'P4ssword',
      })
      .then(() => {
        // insert new user to database
        User.findAll().then((userList) => {
          const savedUser = userList[0];
          console.log('created user', savedUser);
          expect(userList.length).toBe(1);
          expect(savedUser.username).toBe('user1');
          expect(savedUser.email).toBe('user1@gmail.com');

          // use done to wait for async request to complete
          done();
        });
      });
  });
});
