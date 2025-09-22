const userModel = require("../models/user.model");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const BlacklistToken = require("../models/blacklistToken.model");
const {
  authenticateUser,
  createUser,
  handleForgotPassword,
  handleResetPassword,
  handleVerifyEmail,
  sendVerificationEmailFnc,
  updateUserDetails,
} = require("../services/user.services");
const asyncHandler = require("../../../utils/asyncHandler");
const adminAuthMiddleware = require("../../../middleware/adminAuth.middleware");

const registerUser = asyncHandler(async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({ errors: error.array() });
  }

  const { email, password, name, phone } = req.body;

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
    // verificationLink, // For testing purposes only. Remove in production.
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({ errors: error.array() });
  }

  const { email, password } = req.body;

  const { user, token } = await authenticateUser(email, password);

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "strict",
  });
  res.status(200).json({ user, token });
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user._id);
  res.status(200).json({ user });
});

const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  const token =
    req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");
  if (token) {
    await BlacklistToken.create({ token });
  }
  res.status(200).json({ message: "Logged out successfully" });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const { message, resetLink } = await handleForgotPassword(email);

  res.status(200).json({ message }); // For testing purposes only. Remove in production.
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.query;
  const { newPassword } = req.body;

  const { message } = await handleResetPassword(token, newPassword);

  res.status(200).json({ message });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  const { message } = await handleVerifyEmail(token);
  res.status(200).json({ message });
});
const resendVerificationEmail = asyncHandler(async (req, res) => {
  // const { mail } = req.body;
  const { mail } = req.query;

  const { message, verificationLink } = await sendVerificationEmailFnc(mail);
  res.status(200).json({ message });
});

// Update user details (name, phone)
const updateUser = asyncHandler(async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({ errors: error.array() });
  }

  const updatedUser = await updateUserDetails(req.user._id, req.body);

  return res
    .status(200)
    .json({ user: updatedUser, message: "Profile updated successfully" });
});

// Admin: list all users
const listAllUsersAdmin = asyncHandler(async (req, res) => {
  const users = await require("../services/user.services").listAllUsers();
  res.status(200).json({ success: true, count: users.length, users });
});

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  logoutUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  updateUser,
  listAllUsersAdmin,
};
