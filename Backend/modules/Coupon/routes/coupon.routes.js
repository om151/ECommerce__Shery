const express = require("express");
const router = express.Router();
const couponController = require("../controllers/coupon.controller");
const { validateCreateCoupon, validateEditCoupon, validateCouponId,validateCreateCouponUsage } = require("../validation/coupon.validation");
const authMiddleware = require("../../../middleware/auth.middleware");
const adminMiddleware = require("../../../middleware/adminAuth.middleware");

const couponUsageController = require("../controllers/couponUsage.controller");


// Create Coupon
router.post("/create", authMiddleware, adminMiddleware, validateCreateCoupon, couponController.createCoupon);

// Edit Coupon
router.put("/:couponId", authMiddleware, adminMiddleware, validateCouponId, validateEditCoupon, couponController.editCoupon);

// Soft Delete Coupon
router.delete("/:couponId", authMiddleware, adminMiddleware, validateCouponId, couponController.softDeleteCoupon);



// Create Coupon Usage
router.post(
  "/couponUsages",
  authMiddleware,
  validateCreateCouponUsage,
  couponUsageController.createCouponUsage
);

module.exports = router;
