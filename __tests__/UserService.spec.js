const request = require('supertest');
const app = require('../src/app');
const User = require('../src/user/User');
const sequelize = require('../src/config/database');
const nodemailerStub = require('nodemailer-stub');
const SMTPServer = require('smtp-server').SMTPServer;
const EmailService = require('../src/email/EmailService');

beforeAll(function () {
  // initailize database before each test case
  return sequelize.sync({ force: true });
});

beforeEach(async () => {
  // clean User table before each test
  await User.destroy({ truncate: true });
});

const validUser = {
  username: 'user1',
  email: 'user1@mail.com',
  password: 'P4ssword',
};
const postUser = async (post = validUser) => {
  // mock app test server with post request api
  return request(app).post('/api/1.0/users').send(post);
};
describe('User Registration', () => {
  it('should return 200 when user sign up is valid', async () => {
    // mock api request using supertest request
    const response = await postUser();
    console.log('user registration', response.body);
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
    expect(savedUser.email).toBe('user1@mail.com');

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
      email: 'user1@mail.com',
      password: 'P4ssword',
    });
    expect(response.statusCode).toBe(400);
  });

  it('returns errors for both username is null and email is in use', async () => {
    await User.create({ ...validUser });
    const response = await postUser({ username: null, email: 'user1@mail.com', password: 'P4ssword' });
    console.log('response', Object.keys(response.body.validationErrors));
    expect(Object.keys(response.body.validationErrors)).toEqual(['username', 'email']);
  });

  it.each`
    field         | value              | message
    ${'username'} | ${null}            | ${'Username cannot be null'}
    ${'username'} | ${'usr'}           | ${'Must have min 4 and max 32 characters'}
    ${'username'} | ${'a'.repeat(33)}  | ${'Must have min 4 and max 32 characters'}
    ${'email'}    | ${null}            | ${'Email cannot be null'}
    ${'email'}    | ${'mail'}          | ${'Email is not valid'}
    ${'password'} | ${null}            | ${'Password cannot be null'}
    ${'password'} | ${'pass'}          | ${'Password must be at least 6 characters'}
    ${'password'} | ${'allowcase'}     | ${'Password must have at least 1 uppercase character and 1 number'}
    ${'password'} | ${'1234567'}       | ${'Password must have at least 1 uppercase character and 1 number'}
    ${'password'} | ${'lowerandUPPER'} | ${'Password must have at least 1 uppercase character and 1 number'}
    ${'password'} | ${'UPPER44'}       | ${'Password must have at least 1 uppercase character and 1 number'}
  `('return $message when field is $field and value is $value', async ({ field, message, value }) => {
    let user = {
      username: 'user1',
      email: 'user1@email.com',
      password: 'P4ssword',
    };
    user[field] = value;
    const response = await postUser(user);
    expect(response.body.validationErrors[field]).toBe(message);
  });

  it('returns Email in use when same email already exists', async () => {
    await User.create({ ...validUser });
    const response = await postUser();
    // console.log('response', response);
    expect(response.body.validationErrors.email).toBe('Email in use');
  });

  it('it returns inactive is true for new user', async () => {
    await postUser();
    const users = await User.findAll();
    const user = users[0];
    // console.log('found user', users);
    expect(user.inactive).toBe(true);
  });

  it('it returns inactive is true for new user when inactive set as false', async () => {
    await postUser({ ...validUser, inactive: false });
    const users = await User.findAll();
    const user = users[0];
    // console.log('found user', users);
    expect(user.inactive).toBe(true);
  });

  it('create activation token for new user', async () => {
    await postUser();
    const users = await User.findAll();
    const user = users[0];
    // console.log('found user', users);
    expect(user.activationToken).toBeTruthy();
  });

  it('sends activation token to email', async () => {
    // get last mail of nodemailer stub
    // const lastMail = nodemailerStub.interactsWithMail.lastMail();
    let lastMail;
    // setup smtp server
    const server = new SMTPServer({
      authOptional: true,
      onData(stream, session, callback) {
        let mailBody;
        stream.on('data', (data) => {
          mailBody += data.toString();
          console.log('mail body', mailBody);
        });
        stream.on('end', () => {
          lastMail = mailBody;
          callback();
        });
      },
    });

    await server.listen(8587, 'localhost');
    await postUser();
    await server.close();
    // console.log('last mail', lastMail);
    // check if last mail contains token
    expect(lastMail).toContain('user1@mail.com');
    // query for saved user
    const users = await User.findAll();
    const savedUser = users[0];
    expect(lastMail).toContain(savedUser.activationToken);
  });

  it('returns 502 Gateway error if email send fails', async () => {
    // mock a rejected response from email send activation code meethod
    const mockActivation = jest
      .spyOn(EmailService, 'sendActivationCode')
      .mockRejectedValue({ message: 'Fail to deliver email' });
    const response = await postUser();
    expect(response.status).toBe(502);
    mockActivation.mockRestore();
  });

  it('returns Email failure message if email send fails', async () => {
    // mock a rejected response from email send activation code meethod
    const mockActivation = jest.spyOn(EmailService, 'sendActivationCode').mockRejectedValue();
    const response = await postUser();
    expect(response.status).toBe(502);
    mockActivation.mockRestore();
    expect(response.body.message).toBe('Email Failure');
  });

  it('does not save user to database if email send fails', async () => {
    // mock (implements) a new Error with the following message for EmailService send activation code method
    const mockActivation = jest
      .spyOn(EmailService, 'sendActivationCode')
      .mockRejectedValue({ message: 'Fail to deliver email' });
    await postUser();
    const users = await User.findAll();
    const savedUser = users[0];
    // console.log('mockActivation response', mockActivation);
    mockActivation.mockRestore();
    expect(savedUser).toBeFalsy();
  });
});
