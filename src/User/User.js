const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Model = Sequelize.Model;

class User extends Model {}

User.init(
  {
    username: { type: Sequelize.STRING },
    password: { type: Sequelize.STRING },
    email: { type: Sequelize.STRING, unique: true },
  },
  {
    sequelize, // pass sequelize instance
    modelName: 'user', // define table name
  }
);

module.exports = User;
