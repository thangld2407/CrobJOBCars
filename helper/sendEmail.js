const nodemailer = require("nodemailer");

async function sendEmail(options) {
  console.log("Sending email...");
  // const transporter = nodemailer.createTransport({
  //   host: process.env.SMTP_HOST,
  //   port: process.env.SMTP_PORT,
  //   secure: false,
  //   auth: {
  //     user: process.env.SMTP_EMAIL,
  //     pass: process.env.SMTP_PASSWORD,
  //   },
  // });
  // transporter.verify().then(console.log).catch(console.error);

  // var mailOptions = {
  //   from: `${process.env.FROM_NAME} <${process.env.SMTP_EMAIL}>`,
  //   to: options.email,
  //   subject: options.subject,
  //   html: options.html,
  // };
  // await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
