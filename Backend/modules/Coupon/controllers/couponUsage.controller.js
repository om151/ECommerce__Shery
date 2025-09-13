const couponUsageService = require("../services/couponUsage.service");

exports.createCouponUsage = async (req, res, next) => {
  try {
    const usage = await couponUsageService.createCouponUsage(req.body);
    res.status(201).json({ message: "Coupon usage recorded", usage });
  } catch (err) {
    next(err);
  }
};
