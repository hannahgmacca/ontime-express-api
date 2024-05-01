/* eslint-disable import/no-extraneous-dependencies */
const nodemailer = require('nodemailer');

export const sendEmail = async (toEmail: string, subject: string, htmlBody?: string) => {
  const email: string = process.env.RECOVERY_EMAIL || '';
  const password: string = process.env.RECOVERY_PASSWORD || '';

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: email,
      pass: password,
    },
    port: 587,
    secure: false,
  });

  await transporter
    .sendMail({
      from: `"OnTime App" <${email}>`,
      to: toEmail,
      subject: subject,
      html: htmlBody,
    })
    .then((r: any) => {
      console.log(r);
      return r;
    })
    .catch(() => {
      throw new Error('There was an issue sending email');
    });
};

export const generatePasswordResetHtml = (token: string) => {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OnTime Password Reset</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f7f7f7;
      }
      .container {
        max-width: 600px;
        margin: 50px auto;
        padding: 20px;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
      h1 {
        color: #333;
        text-align: center;
      }
      p {
        color: #555;
        font-size: 18px;
        text-align: center;
      }
      a.button {
        display: block;
        width: 200px;
        margin: 20px auto;
        padding: 10px 20px;
        text-align: center;
        color: #fff;
        background-color: #007bff;
        border: none;
        border-radius: 4px;
        text-decoration: none;
        transition: background-color 0.3s ease;
      }
      a.button:hover {
        background-color: #0056b3;
      }
    </style>
  </head>
  <body>
  
  <div class="container">
    <h1>OnTime Password Reset</h1>
    <p>Please click the following link to reset your password:</p>
    <a class="button" href="www.google.com/token=${token}">Reset Password</a>
  </div>
  
  </body>
  </html>
  `;
};
