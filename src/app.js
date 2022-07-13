const express = require('express');
const UserRouter = require('./User/UserRouter');
const app = express();

// body parser
app.use(express.json());

// user routes
app.use(UserRouter);

module.exports = app;
