const userModel = require("../models/user.model");
const crypto = require("crypto");
const {
  sendVerificationEmail,
  sendResetPasswordEmail,
} = require("../../../utils/emailService");
const CustomError = require("../../../utils/CustomError");

const MAX_LOGIN_ATTEMPTS = 3;
const LOCK_TIME = 10 * 60 * 1000;
const asyncHandler = require("../../../utils/asyncHandler");

async function createUser({ email, password, name, phone }) {
  try {
    const hashPassword = await userModel.hashPassword(password);

    const user = await userModel.create({
      email,
      password: hashPassword,
      name,
      phone,
      emailVerified: false,
    });

    const { message, verificationLink } = await sendVerificationEmailFnc(email);
    return { user, verificationLink };
  } catch (error) {
    throw new CustomError(
      error.message || "Error sending verification email",
      error.statusCode || 500,
      error.name || "EmailServiceError"
    );
  }
}

async function authenticateUser(email, password) {
  const user = await userModel.findOne({ email }).select("+password");

  if (!user)
    throw new CustomError(
      "Invalid credentials",
      401,
      "InvalidCredentialsError"
    );

  if (user.lockUntil && user.lockUntil > Date.now()) {
    const wait = Math.ceil((user.lockUntil - Date.now()) / 60000);
    throw new CustomError(
      `Account locked. Try again in ${wait} minute(s).`,
      403,
      "AccountLockedError"
    );
  }

  if (!user.password) {
    throw new CustomError("Password is required", 400, "MissingPasswordError");
  }

  if (!user.emailVerified) {
    throw new CustomError(
      "Please verify your email before logging in.",
      403,
      "EmailNotVerifiedError"
    );
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.lockUntil = Date.now() + LOCK_TIME;
      await user.save();
      throw new CustomError(
        "Account locked due to too many failed attempts. Try again in 10 minutes.",
        403,
        "AccountLockedError"
      );
    }
    await user.save();
    throw new CustomError(
      `Password Not Correct. ${
        MAX_LOGIN_ATTEMPTS - user.failedLoginAttempts
      } attempts left`,
      400,
      "InvalidCredentialsError"
    );
  }

  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();

  const token = await user.generateAuthToken();
  return { user, token };
}

async function updateUserDetails(userId, data) {
  const allowedFields = ["name", "phone"];
  const updates = {};
  for (const key of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      updates[key] = data[key];
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new CustomError("No valid fields to update", 400, "NoUpdateFields");
  }

  // Ensure phone is unique when updating
  if (updates.phone) {
    const existing = await userModel.findOne({
      phone: updates.phone,
      _id: { $ne: userId },
    });
    if (existing) {
      throw new CustomError(
        "Phone number already exists",
        400,
        "PhoneExistsError"
      );
    }
  }

  const updatedUser = await userModel.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser)
    throw new CustomError("User not found", 404, "UserNotFound");

  return updatedUser;
}

async function handleForgotPassword(email) {
  const user = await userModel.findOne({ email });
  if (!user)
    return { message: "If this email exists, a reset link has been sent" };

  if (user.emailVerified === false) {
    throw new CustomError(
      "Please verify your email before resetting password.",
      403,
      "EmailNotVerifiedError"
    );
  }

  // Per-day reset request count
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!user.resetRequestDate || user.resetRequestDate < today) {
    user.resetRequestDate = today;
    user.resetRequestCount = 0;
  }

  if (user.resetRequestCount >= 3) {
    throw new CustomError(
      "You can only request password reset 3 times per day.",
      403,
      "PasswordResetLimitError"
    );
  }

  if (
    user.lastPasswordResetDone &&
    user.lastPasswordResetDone > Date.now() - 24 * 60 * 60 * 1000
  ) {
    throw new CustomError(
      "You can only reset your password once every 24 hours.",
      403,
      "PasswordResetLimitError"
    );
  }

  if (
    user.lastPasswordResetRequest &&
    user.lastPasswordResetRequest > Date.now() - 15 * 60 * 1000
  ) {
    throw new CustomError(
      "You can only request a password reset once every 15 minutes.",
      403,
      "PasswordResetLimitError"
    );
  }

  user.resetRequestCount = (user.resetRequestCount || 0) + 1;
  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000;
  user.lastPasswordResetRequest = Date.now();
  await user.save();

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await sendResetPasswordEmail(email, resetLink);

  return {
    message: "If this email exists, a reset link has been sent.",
    resetLink,
  };
}

async function handleResetPassword(token, newPassword) {
  const user = await userModel.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user)
    throw new CustomError("Invalid or expired token", 400, "InvalidTokenError");

  user.password = await userModel.hashPassword(newPassword);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.lastPasswordResetDone = Date.now();
  await user.save();

  return { message: "Password reset successful" };
}

async function handleVerifyEmail(token) {
  const user = await userModel.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() },
  });
  if (!user)
    throw new CustomError(
      "Invalid or expired verification link.",
      400,
      "InvalidTokenError"
    );

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  return { message: "Email verified successfully." };
}

async function sendVerificationEmailFnc(email) {
  const user = await userModel.findOne({ email });
  if (!user) {
    throw new CustomError("User not found", 404, "UserNotFoundError");
  }

  if (user.emailVerified) {
    throw new CustomError(
      "Email is already verified.",
      400,
      "EmailAlreadyVerifiedError"
    );
  }

  // If token is expired or not present, generate a new one
  if (
    !user.emailVerificationToken ||
    !user.emailVerificationExpires ||
    user.emailVerificationExpires < Date.now()
  ) {
    user.emailVerificationToken = crypto.randomBytes(32).toString("hex");
    user.emailVerificationExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();
  } else {
    throw new CustomError(
      "A verification email has already been sent. Please wait until the previous one expires.",
      400,
      "VerificationEmailAlreadySentError"
    );
  }

  const verificationLink = `${process.env.BACKEND_URL}/user/verify-email?token=${user.emailVerificationToken}`;
  const resendVerificationLink = `${process.env.BACKEND_URL}/user/resend-verification-email?mail=${user.email}`;
  await sendVerificationEmail(
    user.email,
    verificationLink,
    resendVerificationLink
  );

  return { message: "Verification email sent.", verificationLink };
}

module.exports = {
  createUser,
  authenticateUser,
  updateUserDetails,
  handleForgotPassword,
  handleResetPassword,
  handleVerifyEmail,
  sendVerificationEmailFnc,
  listAllUsers,
};

// Admin: list all users with safe projection
async function listAllUsers() {
  const projection = {
    password: 0,
    addresses: 0,
    wishlist: 0,
    cart: 0,
    orderHistory: 0,
    resetPasswordToken: 0,
    resetPasswordExpires: 0,
    emailVerificationToken: 0,
    emailVerificationExpires: 0,
    __v: 0,
  };

  const users = await userModel
    .find({}, projection)
    .sort({ createdAt: -1 })
    .lean();
  return users;
}
