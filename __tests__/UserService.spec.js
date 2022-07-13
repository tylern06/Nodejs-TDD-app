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

const postValidUser = async () => {
  return request(app).post('/api/1.0/users').send({
    username: 'user1',
    email: 'user1@gmail.com',
    password: 'P4ssword',
  });
};
describe('User Registration', () => {
  it('should return 200 when user sign up is valid', async () => {
    // mock api request using supertest request
    const response = await postValidUser();
    expect(response.status).toBe(200);
  });
  it('return success message when sign up is valid', async () => {
    // mock api request using supertest request
    const response = await postValidUser();
    expect(response.body.message).toBe('User created');
    // use  to wait for async request to complete
  });
  it('saves user to database', async () => {
    // mock api request using supertest request
    // mock body message with user info to server
    // insert new user to database
    await postValidUser();
    const userList = await User.findAll();
    const savedUser = userList[0];
    expect(savedUser.username).toBe('user1');
    expect(savedUser.email).toBe('user1@gmail.com');

    // use done to wait for callback async request to complete
  });
  it('it hashes the password', async () => {
    // mock api request using supertest request
    // mock body message with user info to server
    await postValidUser();
    // insert new user to database
    const userList = await User.findAll();
    const savedUser = userList[0];
    expect(savedUser.password).not.toBe('P4ssword');
  });
});
