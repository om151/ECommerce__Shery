const mongoose = require("mongoose");

// Stores a snapshot of the product/variant at time of ordering
const OrderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductVariant" },
    title: { type: String, required: true }, // snapshot of product.title
    variantName: { type: String }, // snapshot of variant name (size/color combination)
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 }, // final unit selling price after per-item discounts
    currency: { type: String, default: "USD" },
    subtotal: { type: Number, required: true, min: 0 }, // quantity * unitPrice
    // Optional per-item discount info (if needed later)
    // discountAmount: { type: Number, default: 0 },
    // total: { type: Number, required: true, min: 0 }, // subtotal - discountAmount
  },
  { timestamps: true }
);

module.exports = mongoose.model("OrderItem", OrderItemSchema);
