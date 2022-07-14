const Sequelize = require('sequelize');
const config = require('config');
// get database config
const _config = config.get('database');
// console.log('env:', process.env, _config);
// initailize db instance with connection string
const sequelize = new Sequelize(_config.database, _config.username, _config.password, {
  dialect: _config.dialect,
  storage: _config.storage,
  logging: _config.dialect.logging,
});

module.exports = sequelize;
