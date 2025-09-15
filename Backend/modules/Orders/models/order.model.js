const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true }, // e.g. YEAR-SEQ or random
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OrderItem",
        required: true,
      },
    ],

    // Monetary summary
    currency: { type: String, default: "INR" },
    itemsSubtotal: { type: Number, required: true, min: 0 }, // sum of item sub-totals before order-level discounts
    itemsDiscountTotal: { type: Number, default: 0, min: 0 }, // sum of per-item discounts
    orderDiscount: { type: Number, default: 0, min: 0 }, // e.g. coupon / promo applied to whole order
    shippingFee: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    grandTotal: { type: Number, required: true, min: 0 }, // (itemsSubtotal - itemsDiscountTotal - orderDiscount) + shippingFee + tax

    // Coupon
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },

    // Address snapshot (denormalized so later address edits don't alter historical orders)
    shippingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      
    },
    billingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
    },

    // Status workflow
    status: {
      type: String,
      enum: [
        "pending", // created but not yet paid (if prepaid required)
        "processing", // payment confirmed, preparing
        "shipped", // handed to carrier
        "delivered", // delivered to customer
        "cancelled", // cancelled before shipment
        "returned", // returned after delivery
      ],
      default: "pending",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: [
        "unpaid",
        "pending", // at least one payment record created but not captured
        "paid",
        "refunded",
        "partially_refunded",
      ],
      default: "unpaid",
      index: true,
    },
    payments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PaymentInfo",
      },
    ],

    notes: { type: String },
    meta: { type: mongoose.Schema.Types.Mixed }, // flexible field for integration data
  },
  { timestamps: true }
);

// Useful compound indexes for common queries
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ paymentStatus: 1, createdAt: -1 });

module.exports = mongoose.model("Order", OrderSchema);
