const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const upload = require("../../../middleware/upload");
const authMiddleware = require("../../../middleware/auth.middleware");
const adminAuthMiddleware = require("../../../middleware/adminAuth.middleware");
const {
  validateProduct,
  validateProductEdit,
  validateVariantEdit,
  validateNewVariant,
  validateProductId,
  validateVariantId,
} = require("../validation/product.validation");
const { parse } = require("dotenv");

parseProductFormData = (req, res, next) => {
  if (req.body.categories && typeof req.body.categories === "string") {
    try {
      req.body.categories = JSON.parse(req.body.categories);
    } catch {
      req.body.categories = req.body.categories
        .split(",")
        .map((cat) => cat.trim());
    }
  }
  if (req.body.searchKeywords && typeof req.body.searchKeywords === "string") {
    try {
      req.body.searchKeywords = JSON.parse(req.body.searchKeywords);
    } catch {
      req.body.searchKeywords = req.body.searchKeywords
        .split(",")
        .map((kw) => kw.trim());
    }
  }
  if (req.body.variants && typeof req.body.variants === "string") {
    try {
      req.body.variants = JSON.parse(req.body.variants);
    } catch {
      // Handle repeated fields like variants[0][field]
      try {
        req.body.variants = Array.isArray(req.body.variants)
          ? req.body.variants
          : [req.body.variants];
      } catch {
        req.body.variants = [req.body.variants];
      }
    }
  }
  if (req.body.attributes && typeof req.body.attributes === "string") {
    try {
      req.body.attributes = JSON.parse(req.body.attributes);
    } catch {
      req.body.attributes = {};
    }
  }
  next();
};

// --- Add Product with Variants ---
router.post(
  "/add",

  authMiddleware,
  adminAuthMiddleware,
  // Accept files provided under any field name (e.g., images_<tempId>)
  upload.any(),
  parseProductFormData,
  validateProduct,
  productController.addProductWithVariants
);

// --- Product Edit Route ---
router.put(
  "/edit/:productId",
  authMiddleware,
  adminAuthMiddleware,
  upload.array("images", 20),
  async (req, res, next) => {
    console.log("Files received:", req.body);
    next();
  },
  parseProductFormData,
  validateProductEdit,
  productController.editProduct
);

// --- Variant Edit Route ---
router.put(
  "/variant/edit/:variantId",
  authMiddleware,
  adminAuthMiddleware,
  upload.array("images", 10),
  parseProductFormData,
  validateVariantEdit,
  productController.editVariant
);

// --- Add New Variant to Product ---
router.post(
  "/variant/add/:productId",
  authMiddleware,
  adminAuthMiddleware,
  upload.array("images", 10),
  parseProductFormData,
  validateNewVariant,
  productController.addVariantToProduct
);

// --- Delete Variant from Product ---
router.delete(
  "/variant/:variantId",
  validateVariantId,
  authMiddleware,
  adminAuthMiddleware,
  productController.deleteVariantFromProduct
);

// --- Delete Product (and all its variants, inventories, reviews) ---
router.delete(
  "/:productId",
  validateProductId,
  authMiddleware,
  adminAuthMiddleware,
  productController.deleteProduct
);

// --- Public: Get all products ---
router.get("/", productController.listAllProducts);

module.exports = router;
