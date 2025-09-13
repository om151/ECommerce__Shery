const { body, validationResult } = require("express-validator");

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

exports.validateAddToCart = [
  body("productId").notEmpty().isMongoId().withMessage("Valid productId is required"),
  body("variantId").notEmpty().isMongoId().withMessage("Valid variantId is required"),
  body("quantity").notEmpty().isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
  handleValidation,
];

exports.validateEditCart = [
  body("productId").notEmpty().isMongoId().withMessage("Valid productId is required"),
  body("variantId").notEmpty().isMongoId().withMessage("Valid variantId is required"),
  body("quantity").notEmpty().isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
  handleValidation,
];

exports.validateRemoveFromCart = [
  body("productId").notEmpty().isMongoId().withMessage("Valid productId is required"),
  body("variantId").notEmpty().isMongoId().withMessage("Valid variantId is required"),
  handleValidation,
];
