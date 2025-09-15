const { body } = require("express-validator");

// Register validation
const validateRegister = [
  body("email").isEmail().withMessage("Invalid Email"),
  body("name")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be 2-50 characters long"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,100}$/
    )
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  body("phone")
    .isLength({ min: 10, max: 10 })
    .withMessage("Phone number must be exactly 10 digits")
    .isMobilePhone()
    .withMessage("Invalid Phone Number"),
];

// Login validation
const validateLogin = [
  body("email").isEmail().withMessage("Invalid Email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

// Forgot password validation
const validateForgotPassword = [
  body("email").isEmail().withMessage("Invalid Email"),
];

// Reset password validation
const validateResetPassword = [
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),
];

// Edit user details validation
const validateEditUser = [
  body("name")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be 2-50 characters long"),
  body("phone")
    .optional()
    .isLength({ min: 10, max: 10 })
    .withMessage("Phone number must be exactly 10 digits")
    .isMobilePhone()
    .withMessage("Invalid Phone Number"),
];

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateEditUser,
};
