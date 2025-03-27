import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: 'live.smtp.mailtrap.io',
  port: 587,
  secure: false,
  auth: {
      user: process.env.MAILTRAP_USER_ID,
      pass: process.env.MAILTRAP_USER_PASSWORD,
  },
});

export {transporter}