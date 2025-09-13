const CouponUsage = require("../models/couponUsages.model");

async function createCouponUsage(data) {
  const usage = new CouponUsage(data);
  await usage.save();
  return usage;
}

module.exports = {
  createCouponUsage,
};
