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
  body("validFrom").notEmpty().withMessage("Valid from date is required"),
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
    .notEmpty()
    .withMessage("Valid from date is required"),
  handleValidation,
];

exports.validateCouponId = [
  param("couponId").isMongoId().withMessage("Invalid coupon ID"),
  handleValidation,
];

