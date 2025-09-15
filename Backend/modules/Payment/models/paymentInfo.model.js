const mongoose = require("mongoose");

// Dedicated payment record allowing multiple attempts / partials / refunds
const PaymentInfoSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Amounts are stored in major currency units; if you need minor (paise), store also minorAmount
    currency: { type: String, default: "INR" },
    amountRequested: { type: Number, required: true, min: 0 }, // what we asked gateway to charge
    amountAuthorized: { type: Number, min: 0 }, // authorized (card hold)
    amountCaptured: { type: Number, min: 0 }, // actually captured
    amountRefunded: { type: Number, default: 0, min: 0 },

    method: { type: String, required: true, default: "cod" }, // e.g. 'card', 'upi', 'netbanking', 'cod'
    provider: { type: String }, // gateway name: 'razorpay', 'stripe', etc.
    transactionId: { type: String, index: true }, // gateway payment id
    referenceId: { type: String }, // internal reference (if any)

    status: {
      type: String,
      enum: [
        "pending", // created but not yet authorized
        "authorized", // funds held
        "captured", // funds captured
        "failed", // failed
        "refunded", // fully refunded
        "partially_refunded", // partial refund
      ],
      default: "pending",
      index: true,
    },

    failureReason: { type: String },
    meta: { type: mongoose.Schema.Types.Mixed }, // raw gateway payload snapshots, etc.
  },
  { timestamps: true }
);

PaymentInfoSchema.index({ userId: 1, status: 1, createdAt: -1 });
PaymentInfoSchema.index({ transactionId: 1 });

module.exports = mongoose.model("PaymentInfo", PaymentInfoSchema);
