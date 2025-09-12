const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

const sendVerificationEmail = async (to, verificationLink,resendVerificationLink) => {
  const subject = "Verify your email address";
  const html = `
    <p>Thank you for registering!</p>
    <p>Please verify your email by clicking the link below:</p>
    <a href="${verificationLink}">${verificationLink}</a>
    <p>This link will expire in 5 minutes.</p>
    <p>If you need a new verification link, please request it again.  <a href="${resendVerificationLink}">Click Here</a></p>
  `;
  try {
    await sendEmail(to, subject, html);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

const sendResetPasswordEmail = async (to, resetLink,) => {
  const subject = "Reset your password";
  const html = `
    <p>You requested a password reset.</p>
    <p>Click the link below to reset your password:</p>
    <a href="${resetLink}">${resetLink}</a>
    <p>This link will expire in 1 hour.</p>
    <p>If you did not request this, please ignore this email.</p>
  `;
  try {
    await sendEmail(to, subject, html);
  } catch (error) {
    console.error("Error sending reset password email:", error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendResetPasswordEmail,
};
