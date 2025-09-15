const { body } = require("express-validator");

const validateProcessPayment = [
  body("orderId").isMongoId().withMessage("orderId must be a valid id"),
  body("method")
    .isIn(["cod", "card", "upi"])
    .withMessage("method must be one of cod, card, upi"),
];

const validateVerifyPayment = [
  body("orderId").isMongoId().withMessage("orderId must be a valid id"),
  body("razorpay_order_id")
    .isString()
    .isLength({ min: 10 })
    .withMessage("Invalid razorpay_order_id"),
  body("razorpay_payment_id")
    .isString()
    .isLength({ min: 10 })
    .withMessage("Invalid razorpay_payment_id"),
  body("razorpay_signature")
    .isString()
    .isLength({ min: 10 })
    .withMessage("Invalid razorpay_signature"),
];

module.exports = { validateProcessPayment, validateVerifyPayment };
