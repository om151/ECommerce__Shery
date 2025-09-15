const { body, param } = require("express-validator");

const validateCreateReview = [
  body("productId").isMongoId().withMessage("productId must be a valid id"),
  body("orderId").isMongoId().withMessage("orderId must be a valid id"),
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("rating must be an integer between 1 and 5"),
  body("title")
    .optional()
    .isLength({ min: 1, max: 120 })
    .withMessage("title must be 1-120 chars"),
  body("comment")
    .optional()
    .isLength({ min: 1, max: 1000 })
    .withMessage("comment must be 1-1000 chars"),
];

const validateUpdateReview = [
  param("reviewId").isMongoId().withMessage("reviewId must be a valid id"),
  body("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("rating must be an integer between 1 and 5"),
  body("title")
    .optional()
    .isLength({ min: 1, max: 120 })
    .withMessage("title must be 1-120 chars"),
  body("comment")
    .optional()
    .isLength({ min: 1, max: 1000 })
    .withMessage("comment must be 1-1000 chars"),
];

const validateDeleteReview = [
  param("reviewId").isMongoId().withMessage("reviewId must be a valid id"),
];

module.exports = {
  validateCreateReview,
  validateUpdateReview,
  validateDeleteReview,
};
