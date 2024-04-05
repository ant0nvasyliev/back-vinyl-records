require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport(
  {
    host: "smtp-mail.outlook.com",
    port: 587,
    auth: {
      user: process.env.USER_NAME,
      pass: process.env.USER_PASSWORD,
    },
  },
  {
    from: "antnvslv@hotmail.com",
  }
);

function sendEmail(message) {
  return transporter.sendMail(message);
}

module.exports = sendEmail;
