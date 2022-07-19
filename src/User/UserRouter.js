const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const UserService = require('./UserService');

// apply express validation in middleware
router.post(
  '/api/1.0/users',
  check('username')
    .notEmpty()
    .withMessage('Username cannot be null')
    .bail() // escape chaining if username is null
    .isLength({ min: 4, max: 32 })
    .withMessage('Must have min 4 and max 32 characters'),
  check('email').notEmpty().withMessage('Email cannot be null').bail().isEmail().withMessage('Email is not valid'),
  check('password')
    .notEmpty()
    .withMessage('Password cannot be null')
    .bail()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .bail()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
    .withMessage('Password must have at least 1 uppercase character and 1 number'),
  async (req, res) => {
    // get errors from req
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const validationErrors = {};
      errors.array().forEach((error) => {
        validationErrors[error.param] = error.msg;
      });
      // console.log('validation errors', validationErrors);
      return res.status(400).send({ validationErrors });
    }
    try {
      await UserService.save(req.body);
    } catch (err) {
      // console.log('save user error', err);
      return res.status(400).send({ validationErrors: { email: 'Email in use' } });
    }
    return res.status(200).send({
      message: 'User created',
    });
  }
);

module.exports = router;
