const mongoose = require("mongoose");

const InventorySchema = new mongoose.Schema({
  inventoryId: { type: String, required: true, unique: true, index: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', required: true },
  reservedQuantity: { type: Number, default: 0 },
  quantityAvailable: { type: Number, required: true },
});

module.exports = mongoose.model("Inventory", InventorySchema);