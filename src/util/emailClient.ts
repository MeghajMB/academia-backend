import nodemailer from "nodemailer"

let transporter = nodemailer.createTransport({
    service: "gmail", // Use your email provider
    auth: {
      user: "your-email@gmail.com",
      pass: "your-password",
    },
  });


export {transporter}