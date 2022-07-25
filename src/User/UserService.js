const bcrypt = require('bcrypt');
const User = require('./User');
const crypto = require('crypto');
const sequelize = require('../config/database');
const EmailService = require('../email/EmailService');
const EmailException = require('../email/EmailException');
const InvalidTokenException = require('./InvalidTokenException');

const generateToken = (length) => {
  return crypto.randomBytes(length).toString('hex').substring(0, length);
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
  // create sql transaction
  const transaction = await sequelize.transaction();
  await User.create(user, { transaction });

  try {
    await EmailService.sendActivationCode(email, token);
    await transaction.commit();
  } catch (err) {
    // console.log('send email err', err);
    await transaction.rollback();
    // pass error up to the caller
    // throw new Error(err);
    throw new EmailException();
  }
};

const activate = async (token) => {
  let user = await User.findOne({ where: { activationToken: token } });
  if (!user) {
    throw new InvalidTokenException();
  }
  user.inactive = false;
  user.activationToken = null;
  await user.save();
};

const getUsers = async (page = 0, size = 10) => {
  const usersWithCount = await User.findAndCountAll({
    where: { inactive: false },
    limit: size,
    offset: page * size,
  });
  // console.log('users with count: ', usersWithCount);
  return {
    content: usersWithCount.rows,
    page,
    size,
    totalPages: Math.ceil(usersWithCount.count / size),
  };
};
module.exports = { save, activate, getUsers };
