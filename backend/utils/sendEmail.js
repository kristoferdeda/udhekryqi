const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.ZOHO_EMAIL,
      pass: process.env.ZOHO_PASSWORD, // App password or email password
    },
  });

  await transporter.sendMail({
    from: `"Udhëkryqi" <${process.env.ZOHO_EMAIL}>`,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
