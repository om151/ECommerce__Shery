const { body, param } = require("express-validator");

// Validation for creating an order
const validateCreateOrder = [
  body("items")
    .isArray({ min: 1 })
    .withMessage("Items array is required and must have at least one item"),
  body("items.*.productId")
    .isMongoId()
    .withMessage("Each item must include a valid productId"),
  body("items.*.title")
    .isString()
    .isLength({ min: 1 })
    .withMessage("Each item must include a title"),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Each item must include a quantity of at least 1"),
  body("items.*.unitPrice")
    .isFloat({ min: 0 })
    .withMessage("Each item must include a non-negative unitPrice"),
  body("items.*.variantId")
    .optional()
    .isMongoId()
    .withMessage("variantId must be a valid id if provided"),
  body("currency")
    .optional()
    .isString()
    .isIn(["INR", "USD"]) // based on models default; adjust list as needed
    .withMessage("Invalid currency"),
  body("shippingAddress")
    .isMongoId()
    .withMessage("shippingAddress must be a valid address id"),
  body("billingAddress")
    .optional()
    .isMongoId()
    .withMessage("billingAddress must be a valid address id"),
  body("couponId")
    .optional()
    .isMongoId()
    .withMessage("couponId must be a valid id"),
  // Optional order-level fees/tax; if present must be non-negative
  body("shippingFee").optional().isFloat({ min: 0 }),
  body("tax").optional().isFloat({ min: 0 }),
  body("orderDiscount").optional().isFloat({ min: 0 }),
  body("notes").optional().isString(),
];

module.exports = { validateCreateOrder };

// Validation for updating shipping address on an existing order
const validateUpdateShippingAddress = [
  param("orderId").isMongoId().withMessage("orderId must be a valid id"),
  body("shippingAddress")
    .isMongoId()
    .withMessage("shippingAddress must be a valid address id"),
];

module.exports.validateUpdateShippingAddress = validateUpdateShippingAddress;

// Validation for cancel order
const validateOrderIdParam = [
  param("orderId").isMongoId().withMessage("orderId must be a valid id"),
];

module.exports.validateOrderIdParam = validateOrderIdParam;
