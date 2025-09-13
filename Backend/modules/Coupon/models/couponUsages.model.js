const mongoose = require("mongoose");

const CouponUsageSchema = new mongoose.Schema(
  {
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    discountAmount: { type: Number, required: true },
    usedAt: { type: Date, default: Date.now },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" }, // optional: link to order
  },
  { timestamps: true }
);

// Ensure a user can use a coupon only once per order (if needed)
CouponUsageSchema.index(
  { couponId: 1, userId: 1, orderId: 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model("CouponUsage", CouponUsageSchema);
