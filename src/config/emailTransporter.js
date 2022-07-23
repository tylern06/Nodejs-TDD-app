const nodemailer = require('nodemailer');
// const nodemailerStub = require('nodemailer-stub');

// connect to generic smtp server instead of stub
const transporter = nodemailer.createTransport({
  host: 'localhost',
  port: 8587,
  tls: {
    rejectUnauthorized: false,
  },
});

module.exports = transporter;
