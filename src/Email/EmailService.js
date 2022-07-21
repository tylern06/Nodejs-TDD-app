const nodemailer = require('nodemailer');
const nodemailerStub = require('nodemailer-stub');

const sendActivationCode = async (email, token) => {
  const transporter = nodemailer.createTransport(nodemailerStub.stubTransport);
  await transporter.sendMail({
    from: 'My App <info@my-app.com>',
    to: email,
    subject: 'Account Activation',
    html: `Activation code is ${token}`,
  });
};

module.exports = { sendActivationCode };
