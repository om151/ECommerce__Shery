const { body, param, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Coupon = require("../models/coupon.model");
const User = require("../../User/models/user.model");

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

exports.validateCreateCouponUsage = [
  body("couponId")
    .notEmpty()
    .withMessage("couponId is required")
    .isMongoId()
    .withMessage("Valid couponId is required")
    .bail()
    .custom(async (value) => {
      if (!mongoose.Types.ObjectId.isValid(value))
        throw new Error("Invalid couponId");
      const coupon = await Coupon.findById(value);
      if (!coupon || !coupon.isActive)
        throw new Error("Coupon does not exist or is not active");
      return true;
    }),
  body("userId")
    .notEmpty()
    .withMessage("userId is required")
    .isMongoId()
    .withMessage("Valid userId is required")
    .bail()
    .custom(async (value) => {
      if (!mongoose.Types.ObjectId.isValid(value))
        throw new Error("Invalid userId");
      const user = await User.findById(value);
      if (!user) throw new Error("User does not exist");
      return true;
    }),
  body("discountAmount")
    .notEmpty()
    .isNumeric()
    .withMessage("Discount amount is required and must be a number"),
  body("orderId")
    .optional()
    .isMongoId()
    .withMessage("OrderId must be a valid MongoId"),
  handleValidation,
];

exports.validateCreateCoupon = [
  body("code").notEmpty().withMessage("Code is required"),
  body("name").notEmpty().withMessage("Name is required"),
  body("discountType")
    .isIn(["percentage", "fixed", "free_shipping"])
    .withMessage("Invalid discount type"),
  body("maxDiscount")
    .isNumeric()
    .withMessage("Max discount is required and must be a number"),
  body("validFrom")
    .notEmpty()
    .withMessage("Valid from date is required")
    .custom((value) => {
      if (typeof value === 'string') {
        if (isNaN(Date.parse(value))) throw new Error('validFrom must be a valid ISO date string');
        return true;
      }
      if (typeof value === 'object' && value.$date) {
        if (isNaN(Date.parse(value.$date))) throw new Error('validFrom.$date must be a valid date string');
        return true;
      }
      throw new Error('validFrom must be an ISO string or {$date: "..."}');
    }),
  body("validTo")
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        if (isNaN(Date.parse(value))) throw new Error('validTo must be a valid ISO date string');
        return true;
      }
      if (typeof value === 'object' && value.$date) {
        if (isNaN(Date.parse(value.$date))) throw new Error('validTo.$date must be a valid date string');
        return true;
      }
      throw new Error('validTo must be an ISO string or {$date: "..."}');
    }),
  handleValidation,
];

exports.validateEditCoupon = [
  body("code").optional().notEmpty().withMessage("Code cannot be empty"),
  body("name").optional().notEmpty().withMessage("Name cannot be empty"),
  body("discountType")
    .optional()
    .isIn(["percentage", "fixed", "free_shipping"])
    .withMessage("Invalid discount type"),
  body("maxDiscount")
    .optional()
    .isNumeric()
    .withMessage("Max discount must be a number"),
  body("validFrom")
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        if (isNaN(Date.parse(value))) throw new Error('validFrom must be a valid ISO date string');
        return true;
      }
      if (typeof value === 'object' && value.$date) {
        if (isNaN(Date.parse(value.$date))) throw new Error('validFrom.$date must be a valid date string');
        return true;
      }
      throw new Error('validFrom must be an ISO string or {$date: "..."}');
    }),
  body("validTo")
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        if (isNaN(Date.parse(value))) throw new Error('validTo must be a valid ISO date string');
        return true;
      }
      if (typeof value === 'object' && value.$date) {
        if (isNaN(Date.parse(value.$date))) throw new Error('validTo.$date must be a valid date string');
        return true;
      }
      throw new Error('validTo must be an ISO string or {$date: "..."}');
    }),
  handleValidation,
];

exports.validateCouponId = [
  param("couponId").isMongoId().withMessage("Invalid coupon ID"),
  handleValidation,
];

exports.validateValidateCouponRequest = [
  body("code").notEmpty().withMessage("Coupon code is required"),
  body("orderTotal")
    .notEmpty()
    .withMessage("orderTotal is required")
    .isNumeric()
    .withMessage("orderTotal must be a number"),
  body("productIds")
    .optional()
    .isArray()
    .withMessage("productIds must be an array")
    .custom((arr) => arr.every((id) => mongoose.Types.ObjectId.isValid(id)))
    .withMessage("All productIds must be valid Mongo ObjectIds"),
  handleValidation,
];
