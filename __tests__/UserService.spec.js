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

const validUser = {
  username: 'user1',
  email: 'user1@gmail.com',
  password: 'P4ssword',
};
const postUser = async (post) => {
  // mock app test server with post request api
  return request(app).post('/api/1.0/users').send(post);
};
describe('User Registration', () => {
  it('should return 200 when user sign up is valid', async () => {
    // mock api request using supertest request
    const response = await postUser(validUser);
    expect(response.status).toBe(200);
  });
  it('return success message when sign up is valid', async () => {
    // mock api request using supertest request
    const response = await postUser(validUser);
    expect(response.body.message).toBe('User created');
    // use  to wait for async request to complete
  });
  it('saves user to database', async () => {
    // mock api request using supertest request
    // mock body message with user info to server
    // insert new user to database
    await postUser(validUser);
    const userList = await User.findAll();
    const savedUser = userList[0];
    expect(savedUser.username).toBe('user1');
    expect(savedUser.email).toBe('user1@gmail.com');

    // use done to wait for callback async request to complete
  });
  it('it hashes the password', async () => {
    // mock api request using supertest request
    // mock body message with user info to server
    await postUser(validUser);
    // insert new user to database
    const userList = await User.findAll();
    const savedUser = userList[0];
    expect(savedUser.password).not.toBe('P4ssword');
  });

  it('returns 400 error if username is null', async () => {
    // mock api request using supertest request
    // mock body message with user info to server
    const response = await postUser({
      username: null,
      email: 'user1@gmail.com',
      password: 'P4ssword',
    });
    expect(response.statusCode).toBe(400);
  });

  it.each`
    field         | message
    ${'username'} | ${'Username cannot be null'}
    ${'email'}    | ${'Email cannot be null'}
    ${'password'} | ${'Password cannot be null'}
  `('when $field is null $message is received', async ({ field, message }) => {
    let user = { username: 'user1', email: 'user1@email.com', password: 'P4ssword' };
    user[field] = null;
    const response = await postUser(user);
    expect(response.body.validationErrors[field]).toBe(message);
  });

  it('returns size validation error is username is less than 4 chars', async () => {
    // mock api request using supertest request
    // mock body message with user info to server
    const response = await postUser({
      username: 'use',
      email: 'user1@gmail.com',
      password: 'P4ssword',
    });
    expect(response.body.validationErrors.username).toBe('Must have min 4 and max 32 characters');
  });
});
