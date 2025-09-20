const mongoose = require("mongoose");

const ProductVariantSchema = new mongoose.Schema({
  // variantId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  attributes: {
    color: { type: String, required: true },
    size: { type: String, required: true },
  },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  price: { type: Number, required: true },
  compareAtPrice: { type: Number, required: true },
  images: { type: [String] }, // require : true
  inventoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Inventory",
    required: true,
  },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  categories: { type: [String], required: true },
  attributes: { brand: { type: String, required: true } },
  variants: [{ type: mongoose.Schema.Types.ObjectId, ref: "ProductVariant" }],
  searchKeywords: { type: [String], required: true },
  rating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  isDeleted: { type: Boolean, default: false },
});

const ProductVariant = mongoose.model("ProductVariant", ProductVariantSchema);
const Product = mongoose.model("Product", productSchema);

module.exports = { Product, ProductVariant };
