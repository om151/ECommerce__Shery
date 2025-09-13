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
} = require("../controllers/user.controller");
const authMiddleware = require("../../../middleware/auth.middleware");

router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("name")
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters long"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,100}$/
      )
      .withMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    body("phone").isMobilePhone().withMessage("Invalid Phone Number"),
  ],
  registerUser
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  loginUser
);

router.get("/profile", authMiddleware, getProfile);

router.post("/logout", authMiddleware, logoutUser);
router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Invalid Email")],
  forgotPassword
);
router.post(
  "/reset-password",
  [
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long"),
  ],
  resetPassword
);
router.get("/verify-email", verifyEmail);
router.get(
  "/resend-verification-email",
  // [body("email").isEmail().withMessage("Invalid Email")],
  resendVerificationEmail
);

module.exports = router;
