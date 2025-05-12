import nodemailer from "nodemailer"
import config from "../config/configuration";

const transporter = nodemailer.createTransport({
  host: 'live.smtp.mailtrap.io',
  port: 587,
  secure: false,
  auth: {
      user: config.mailtrap.userId,
      pass: config.mailtrap.userPassword,
  },
});

export {transporter}