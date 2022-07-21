const bcrypt = require('bcrypt');
const User = require('./User');
const crypto = require('crypto');

const generateToken = (length) => {
  return crypto
    .randomBytes(length)
    .toString('hex')
    .substring(0, length);
};
const save = async (body) => {
  const { username, password, email } = body;
  const hash = await bcrypt.hash(password, 10);
  const token = generateToken(16);
  const user = {
    username,
    email,
    password: hash,
    activationToken: token,
  };
  // console.log('created user', user);
  await User.create(user);
};

module.exports = { save };
