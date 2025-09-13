const mongoose = require("mongoose");

const InventorySchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product',  },
  variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', },
  reservedQuantity: { type: Number, default: 0 },
  quantityAvailable: { type: Number, required: true },
});

// Ensure one inventory per product-variant pair
InventorySchema.index({ productId: 1, variantId: 1 }, { unique: true });

module.exports = mongoose.model("Inventory", InventorySchema);