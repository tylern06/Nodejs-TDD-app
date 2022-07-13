const Sequelize = require('sequelize');

// initailize db instance with connection string
const sequelize = new Sequelize('hoaxify', 'db-user', 'db-password', {
  dialect: 'sqlite',
  storage: './database.sqlite',
});

module.exports = sequelize;
