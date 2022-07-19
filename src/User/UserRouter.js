const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const UserService = require('./UserService');

router.post(
  '/api/1.0/users',
  check('username')
    .notEmpty()
    .withMessage('Username cannot be null')
    .bail() // escape chaining if username is null
    .isLength({ min: 4 })
    .withMessage('Must have min 4 and max 32 characters'),
  check('email').notEmpty().withMessage('Email cannot be null'),
  check('password').notEmpty().withMessage('Password cannot be null'),
  async (req, res) => {
    // get errors from req
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const validationErrors = {};
      errors.array().forEach((error) => {
        validationErrors[error.param] = error.msg;
      });

      console.log('validation errors', validationErrors);

      return res.status(400).send({ validationErrors });
    }

    await UserService.save(req.body);
    return res.status(200).send({
      message: 'User created',
    });
  }
);

module.exports = router;
