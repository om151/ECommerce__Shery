const Coupon = require("../models/coupon.model");
const CouponUsage = require("../models/couponUsages.model");
const mongoose = require("mongoose");

// Create Coupon
async function createCoupon(data) {
  // Normalize possible extended JSON date objects
  if (
    data.validFrom &&
    typeof data.validFrom === "object" &&
    data.validFrom.$date
  ) {
    data.validFrom = new Date(data.validFrom.$date);
  }
  if (data.validTo && typeof data.validTo === "object" && data.validTo.$date) {
    data.validTo = new Date(data.validTo.$date);
  }
  const coupon = new Coupon(data);
  await coupon.save();
  return coupon;
}

// List all coupons (optionally filter) with pagination
async function listCoupons(filter = {}, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const coupons = await Coupon.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const total = await Coupon.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  return {
    coupons,
    total,
    currentPage: parseInt(page),
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

// Edit Coupon
async function editCoupon(couponId, data) {
  // Normalize possible extended JSON date objects
  if (
    data.validFrom &&
    typeof data.validFrom === "object" &&
    data.validFrom.$date
  ) {
    data.validFrom = new Date(data.validFrom.$date);
  }
  if (data.validTo && typeof data.validTo === "object" && data.validTo.$date) {
    data.validTo = new Date(data.validTo.$date);
  }
  const coupon = await Coupon.findByIdAndUpdate(
    couponId,
    { $set: data },
    { new: true, runValidators: true }
  );
  if (!coupon) throw new Error("Coupon not found");
  return coupon;
}

// Soft Delete Coupon
async function softDeleteCoupon(couponId) {
  const coupon = await Coupon.findById(couponId);
  if (!coupon) throw new Error("Coupon not found");
  if (!coupon.isActive) throw new Error("Coupon already deleted");
  coupon.isActive = false;
  await coupon.save();

  return coupon;
}

// Validate Coupon for an order
async function validateCoupon({ code, userId, orderTotal, productIds = [] }) {
  if (!code) throw new Error("Coupon code is required");

  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
  if (!coupon) throw new Error("Invalid coupon code");
  if (!coupon.isActive) throw new Error("Coupon is not active");

  const now = new Date();
  if (coupon.validFrom && now < coupon.validFrom) {
    throw new Error("Coupon is not yet valid");
  }
  if (coupon.validTo && now > coupon.validTo) {
    throw new Error("Coupon has expired");
  }

  // Usage limit
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    throw new Error("Coupon usage limit reached");
  }

  // User restriction
  if (
    coupon.applicableUserIds &&
    coupon.applicableUserIds.length > 0 &&
    !coupon.applicableUserIds.some((id) => id.toString() === userId.toString())
  ) {
    throw new Error("Coupon not applicable for this user");
  }

  // Product restriction
  if (coupon.applicableProductIds && coupon.applicableProductIds.length > 0) {
    const provided = (productIds || []).map((p) => p.toString());
    const intersection = coupon.applicableProductIds.filter((id) =>
      provided.includes(id.toString())
    );
    if (intersection.length === 0) {
      throw new Error("Coupon not applicable to selected products");
    }
  }

  // Min order value
  if (coupon.minOrderValue && orderTotal < coupon.minOrderValue) {
    throw new Error(
      `Minimum order value of ${coupon.minOrderValue} not reached for this coupon`
    );
  }

  // Calculate discount
  let discountAmount = 0;
  switch (coupon.discountType) {
    case "percentage":
      // Assuming we might add a discountValue later, using maxDiscount as cap
      // Without a percentage value field, treat maxDiscount as percentage if <=100
      const percentage = coupon.percentage <= 100 ? coupon.percentage : 0; // fallback
      discountAmount = (orderTotal * percentage) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
      break;
    case "fixed":
      discountAmount = coupon.maxDiscount; // using maxDiscount as fixed value
      if (discountAmount > orderTotal) discountAmount = orderTotal; // cannot exceed order total
      break;
    case "free_shipping":
      discountAmount = 0; // shipping handled elsewhere
      break;
    default:
      discountAmount = 0;
  }

  // Normalize
  if (discountAmount < 0) discountAmount = 0;

  return {
    valid: true,
    discountAmount,
    coupon,
    message: "Coupon is valid",
  };
}

module.exports = {
  createCoupon,
  editCoupon,
  softDeleteCoupon,
  validateCoupon,
  listCoupons,
};
