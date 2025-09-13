const Coupon = require("../models/coupon.model");

// Create Coupon
async function createCoupon(data) {
  const coupon = new Coupon(data);
  await coupon.save();
  return coupon;
}

// Edit Coupon
async function editCoupon(couponId, data) {
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

module.exports = {
  createCoupon,
  editCoupon,
  softDeleteCoupon,
};
