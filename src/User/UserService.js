const bcrypt = require('bcrypt');
const User = require('./User');

const save = async (body) => {
  const hash = await bcrypt.hash(body.password, 10);
  const user = { ...body, password: hash };
  // console.log('created user', user);
  await User.create(user);
};

module.exports = { save };
