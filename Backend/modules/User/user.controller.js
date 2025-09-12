const userModel = require("./user.model");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const BlacklistToken = require("../User/blacklistToken.model");
const {
  authenticateUser,
  createUser,
  handleForgotPassword,
  handleResetPassword,
  handleVerifyEmail,
  sendVerificationEmailFnc
} = require("./user.services");

const registerUser = async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({ errors: error.array() });
  }
 
  const { email, password, name, phone } = req.body;

  try {
    const isUserAlreadyExist = await userModel.findOne({ email });
    if (isUserAlreadyExist) {
      return res.status(400).json({ message: "User already exists" });
    }

    const isPhoneAlreadyExist = await userModel.findOne({ phone });
    if (isPhoneAlreadyExist) {
      return res.status(400).json({ message: "Phone number already exists" });
    }

    const { user, verificationLink } = await createUser({
      email,
      password,
      name,
      phone,
    });

    res.status(201).json({
      user,
      message: "Registration successful. Please verify your email.",
      verificationLink, // For testing purposes only. Remove in production.
    });
  } catch (error) {
    console.log(error);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || ("Server error", error) });
  }
};

const loginUser = async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({ errors: error.array() });
  }

  const { email, password } = req.body;

  try {
    const { user, token } = await authenticateUser(email, password);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
    });
    res.status(200).json({ user, token });
  } catch (error) {
    console.log(error);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || ("Server error", error) });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || ("Server error", error) });
  }
};

const logoutUser = async (req, res) => {
  res.clearCookie("token");
  const token =
    req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");
  if (token) {
    await BlacklistToken.create({ token });
  }
  res.status(200).json({ message: "Logged out successfully" });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const { message, resetLink } = await handleForgotPassword(email);

    res.status(200).json({ message, resetLink }); // For testing purposes only. Remove in production.
  } catch (error) {
    console.log(error);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || ("Server error", error) });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.query;
  const { newPassword } = req.body;
  try {
    const { message } = await handleResetPassword(token, newPassword);

    res.status(200).json({ message });
  } catch (error) {
    console.log(error);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || ("Server error", error) });
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.query;
  try {
    const { message } = await handleVerifyEmail(token);
    res.status(200).json({ message });
  } catch (error) {
    console.log(error);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || ("Server error", error) });
  }
};
const resendVerificationEmail = async (req, res) => {

  // const { mail } = req.body;
  const { mail } = req.query;

  try{
    const{message , verificationLink} = await sendVerificationEmailFnc(mail);
   res.status(200).json({ message, verificationLink });
  }catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || ("Server error", error) });
  }
}

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  logoutUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail
};
