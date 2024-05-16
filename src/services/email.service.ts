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

export const generatePasswordResetHtml = (code: string) => {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Body</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        padding: 20px;
        background-color: #fff;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
      h1 {
        color: #333;
      }
      p {
        color: #555;
      }
      .code {
        font-size: 24px;
        font-weight: bold;
        color: #007bff;
        margin-top: 10px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Password Reset Code</h1>
      <p>Dear User,</p>
      <p>Your password reset code is:</p>
      <p class="code">${code}</p> 
      <p>Please use this code to reset your password.</p>
      <p>If you did not request a password reset, please ignore this email.</p>
      <p>Thank you!</p>
    </div>
  </body>
  </html>
  
  `;
};

export const generateWelcomeEmailHtml = (password: string, email: string) => {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Body</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        padding: 20px;
        background-color: #fff;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
      h1 {
        color: #333;
      }
      p {
        color: #555;
      }
      .code {
        font-size: 24px;
        font-weight: bold;
        color: #007bff;
        margin-top: 10px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Welcome to OnTime</h1>
      <p>Dear User</p>
      <p>Your account has been created in OnTime.</p>
      <p>Email: ${email}</p> 
      <p>Password: ${password}</p> 
      <p>Please use this password to log in, you can reset your password in user settings.</p>
      <p>Thank you!</p>
    </div>
  </body>
  </html>
  
  `;
};

