const Sequelize = require('sequelize');

// initailize db instance with connection string
const sequelize = new Sequelize('hoaxify', 'db-user', 'db-password', {
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false,
});

module.exports = sequelize;
