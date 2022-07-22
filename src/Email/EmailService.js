const transporter = require('../config/emailTransporter');

const sendActivationCode = async (email, token) => {
  // use nodemail stub to mock email send
  await transporter.sendMail({
    from: 'My App <info@my-app.com>',
    to: email,
    subject: 'Account Activation',
    html: `Activation code is ${token}`,
  });
};

module.exports = { sendActivationCode };
