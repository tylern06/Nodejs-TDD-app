const express = require('express');
const UserRouter = require('./user/UserRouter');
const app = express();

// body parser
app.use(express.json());

// user routes
app.use(UserRouter);

// error handler
app.use(function (err, req, res, next) {
  console.log('error handler', err);
});

module.exports = app;
