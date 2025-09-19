const { Product, ProductVariant } = require("../models/product.model");
const Inventory = require("../models/inventory.model");
const mongoose = require("mongoose");
const { image } = require("../../../config/cloudinary");
const asyncHandler = require("../../../utils/asyncHandler");
const {
  editProductService,
  editVariantService,
  addVariantToProductService,
  addProductWithVariantsService,
  deleteVariantFromProductService,
  deleteProductService,
  listAllProductsService,
} = require("../services/product.service");

// Edit Product
exports.editProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const updatedProduct = await editProductService(
    productId,
    req.body,
    req.files || []
  );
  res
    .status(200)
    .json({ message: "Product updated successfully", product: updatedProduct });
});

// Edit Variant
exports.editVariant = asyncHandler(async (req, res) => {
  const { variantId } = req.params;
  const updatedVariant = await editVariantService(
    variantId,
    req.body,
    req.files || []
  );
  res
    .status(200)
    .json({ message: "Variant updated successfully", variant: updatedVariant });
});

// Add New Variant to Product
exports.addVariantToProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const newVariant = await addVariantToProductService(
    productId,
    req.body,
    req.files || []
  );
  res
    .status(201)
    .json({ message: "Variant added successfully", variant: newVariant });
});

// Add Product with Variants
exports.addProductWithVariants = asyncHandler(async (req, res) => {
  // All fields are already parsed by parseProductFormData middleware
  const {
    title,
    description,
    categories,
    attributes,
    searchKeywords,
    variants,
  } = req.body;

  // Defensive: ensure categories, searchKeywords, variants, attributes are present
  if (!categories || !Array.isArray(categories)) {
    return res.status(400).json({
      success: false,
      message: "Categories are required and must be an array.",
    });
  }
  if (!searchKeywords || !Array.isArray(searchKeywords)) {
    return res.status(400).json({
      success: false,
      message: "Search keywords are required and must be an array.",
    });
  }
  if (!variants || !Array.isArray(variants)) {
    return res.status(400).json({
      success: false,
      message: "Variants are required and must be an array.",
    });
  }
  if (!attributes || typeof attributes !== "object") {
    return res.status(400).json({
      success: false,
      message: "Attributes are required and must be an object.",
    });
  }

  const product = await addProductWithVariantsService({
    title,
    description,
    categories,
    attributes,
    searchKeywords,
    variants,
    files: req.files || [],
  });

  res
    .status(201)
    .json({ message: "Product and variants added successfully", product });
});

// Delete Variant from Product
exports.deleteVariantFromProduct = asyncHandler(async (req, res) => {
  const { variantId } = req.params;
  console.log("Deleting variant:", variantId);
  await deleteVariantFromProductService(variantId);
  res
    .status(200)
    .json({ message: "Variant and its inventory deleted successfully" });
});

// Delete Product (and all its variants, inventories, reviews)
exports.deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  await deleteProductService(productId);
  res.status(200).json({
    message:
      "Product, its variants, inventories, and reviews deleted successfully",
  });
});

// Get All Products (public) with pagination
exports.listAllProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, lowStock } = req.query;
  let result;

  if (lowStock) {
    // If lowStock is provided, filter products with inventory below threshold
    const threshold = Number(lowStock);
    result = await listAllProductsService(page, limit, { lowStock: threshold });
  } else {
    result = await listAllProductsService(page, limit);
  }

  res.status(200).json({
    success: true,
    ...result,
  });
});
