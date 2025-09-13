const asyncHandler = require("../../utils/asyncHandler");
const couponService = require("../services/coupon.service");

exports.createCoupon = asyncHandler(async (req, res, next) => {
 
    const coupon = await couponService.createCoupon(req.body);
    res.status(201).json({ message: "Coupon created successfully", coupon });

});

exports.editCoupon = asyncHandler(async (req, res, next) => {
  
    const { couponId } = req.params;
    const coupon = await couponService.editCoupon(couponId, req.body);
    res.status(200).json({ message: "Coupon updated successfully", coupon });
  
})

exports.softDeleteCoupon =asyncHandler( async (req, res, next) => {
 
    const { couponId } = req.params;
    await couponService.softDeleteCoupon(couponId);
    res.status(200).json({ message: "Coupon deleted (soft) successfully" });
  
})
  