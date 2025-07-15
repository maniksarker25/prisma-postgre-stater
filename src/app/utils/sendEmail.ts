// import nodemailer from "nodemailer";
// import config from "../config";
// export const sendEmail = async (to: string, html: string) => {
//   const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 587,
//     secure: config.env === "production",
//     auth: {
//       //   TODO: replace `user` and `pass` values from <https://forwardemail.net>
//       user: config.emailSender.email,
//       pass: config.emailSender.app_password,
//     },
//     tls: {
//       rejectUnauthorized: false,
//     },
//   });
//   await transporter.sendMail({
//     from: "devsmanik@gmail.com", // sender address
//     to, // list of receivers
//     subject: "Reset your password within 10 mins!", // Subject line
//     text: "", // plain text body
//     html, // html body
//   });
// };

import nodemailer from "nodemailer";
import config from "../config";

const currentDate = new Date();

const formattedDate = currentDate.toLocaleDateString("en-US", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const sendEmail = async (options: { email: string; subject: string; html: any }) => {
  const transporter = nodemailer.createTransport({
    // host: config.smtp.smtp_host,
    host: "smtp.gmail.com",
    port: parseInt(config.smtp.smtp_port as string),
    auth: {
      user: config.smtp.smtp_mail,
      pass: config.smtp.smtp_pass,
    },
  });

  const { email, subject, html } = options;

  const mailOptions = {
    from: `${config.smtp.name} <${config.smtp.smtp_mail}>`,
    to: email,
    date: formattedDate,
    signed_by: "devsmanik.com",
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
