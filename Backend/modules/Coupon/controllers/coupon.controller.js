const asyncHandler = require("../../../utils/asyncHandler");
const couponService = require("../services/coupon.service");

exports.createCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await couponService.createCoupon(req.body);
  res.status(201).json({ message: "Coupon created successfully", coupon });
});

exports.editCoupon = asyncHandler(async (req, res, next) => {
  const { couponId } = req.params;
  const coupon = await couponService.editCoupon(couponId, req.body);
  res.status(200).json({ message: "Coupon updated successfully", coupon });
});

exports.softDeleteCoupon = asyncHandler(async (req, res, next) => {
  const { couponId } = req.params;
  await couponService.softDeleteCoupon(couponId);
  res.status(200).json({ message: "Coupon deleted (soft) successfully" });
});

exports.validateCoupon = asyncHandler(async (req, res, next) => {
  const { code, orderTotal, productIds } = req.body;
  const userId = req.user?._id;
  const result = await couponService.validateCoupon({
    code,
    orderTotal,
    productIds,
    userId,
  });
  res.status(200).json(result);
});

exports.listCoupons = asyncHandler(async (req, res, next) => {
  const { isActive } = req.query;
  const filter = {};
  if (isActive !== undefined) {
    filter.isActive = String(isActive).toLowerCase() === "true";
  }
  const coupons = await couponService.listCoupons(filter);
  res.status(200).json({ coupons });
});
