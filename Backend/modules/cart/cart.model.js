const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', required: true },
    quantity: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const CartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [CartItemSchema], default: [] },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    expiresAt: { type: Date, default: Date.now, expires: '1d' },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", CartSchema);



