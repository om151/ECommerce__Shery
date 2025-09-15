const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  logoutUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  updateUser,
} = require("../controllers/user.controller");
const authMiddleware = require("../../../middleware/auth.middleware");
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateEditUser,
} = require("../validation/user.validation");

router.post("/register", validateRegister, registerUser);

router.post("/login", validateLogin, loginUser);

router.get("/profile", authMiddleware, getProfile);

router.post("/logout", authMiddleware, logoutUser);
router.post("/forgot-password", validateForgotPassword, forgotPassword);
router.post("/reset-password", validateResetPassword, resetPassword);
router.get("/verify-email", verifyEmail);
router.get(
  "/resend-verification-email",
  // [body("email").isEmail().withMessage("Invalid Email")],
  resendVerificationEmail
);

// Edit user details
router.put("/edit", authMiddleware, validateEditUser, updateUser);

module.exports = router;
