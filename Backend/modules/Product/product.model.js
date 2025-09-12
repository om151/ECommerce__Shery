const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  
  title: { type: String, required: true },
  description: { type: String, required: true },
  categories: { type: [String], required: true },
  attributes: { brand: { type: String, required: true } },
  variants: { type: [ProductVariantSchema], default: [] },
  searchKeywords: { type: [String], required: true },
  rating: { type: Number, default: 0 },
  inStock: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  reviews: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Review' }
  ]
});

const ProductVariantSchema = new mongoose.Schema(
  {
    variantId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    attributes: {
      color: { type: String, required: true },
      size: { type: String, required: true },
    },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number, required: true },
    images: { type: [String], required: true }, 
    inventoryId: { type: String, required: true },
  },
  { _id: false }
);

module.exports = mongoose.model("ProductVariant", ProductVariantSchema);
module.exports = mongoose.model("Product", productSchema);
