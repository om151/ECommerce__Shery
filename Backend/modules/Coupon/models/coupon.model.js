const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    discountType: {
      type: String,
      enum: ["percentage", "fixed", "free_shipping"],
      required: true,
    },
    // discountValue: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    maxDiscount: { type: Number, required: true },
    percentage: { type: Number }, // optional percentage value for percentage type
    usageLimit: { type: Number }, // total times coupon can be used
    usageCount: { type: Number, default: 0 }, // how many times used
    validFrom: { type: Date, required: true },
    validTo: { type: Date },
    isActive: { type: Boolean, default: true },
    applicableUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // optional: restrict to users
    applicableProductIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    ], // optional: restrict to products
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", CouponSchema);
