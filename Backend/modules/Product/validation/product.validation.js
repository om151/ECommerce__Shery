const { body, param, validationResult } = require("express-validator");

// Helper to handle validation errors
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

exports.validateProduct = [
  body("title").notEmpty().withMessage("Title is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("categories")
    .isArray({ min: 1 })
    .withMessage("At least one category is required"),
  body("attributes.brand").notEmpty().withMessage("Brand is required"),
  body("searchKeywords")
    .isArray({ min: 1 })
    .withMessage("At least one search keyword is required"),
  body("variants").notEmpty().withMessage("Variants are required"),
  handleValidation,
];

exports.validateProductEdit = [
  param("productId").isMongoId().withMessage("Invalid product ID"),
  body("title").optional().notEmpty().withMessage("Title cannot be empty"),
  body("description")
    .optional()
    .notEmpty()
    .withMessage("Description cannot be empty"),
  body("categories")
    .optional()
    .isArray({ min: 1 })
    .withMessage("At least one category is required"),
  body("attributes.brand")
    .optional()
    .notEmpty()
    .withMessage("Brand cannot be empty"),
  body("searchKeywords")
    .optional()
    .isArray({ min: 1 })
    .withMessage("At least one search keyword is required"),
  handleValidation,
];

exports.validateVariantEdit = [
  param("variantId").isMongoId().withMessage("Invalid variant ID"),
  body("name").optional().notEmpty().withMessage("Name cannot be empty"),
  body("attributes.color")
    .optional()
    .notEmpty()
    .withMessage("Color cannot be empty"),
  body("attributes.size")
    .optional()
    .notEmpty()
    .withMessage("Size cannot be empty"),
  body("price").optional().isNumeric().withMessage("Price must be a number"),
  body("compareAtPrice")
    .optional()
    .isNumeric()
    .withMessage("Compare at price must be a number"),
  handleValidation,
];

exports.validateNewVariant = [
  param("productId").isMongoId().withMessage("Invalid product ID"),
  body("name").notEmpty().withMessage("Name is required"),
  body("attributes.color").notEmpty().withMessage("Color is required"),
  body("attributes.size").notEmpty().withMessage("Size is required"),
  body("price")
    .isNumeric()
    .withMessage("Price is required and must be a number"),
  body("compareAtPrice")
    .isNumeric()
    .withMessage("Compare at price is required and must be a number"),
  body("quantityAvailable")
    .isNumeric()
    .withMessage("Quantity available is required and must be a number"),
  handleValidation,
];

exports.validateProductId = [
  param("productId").isMongoId().withMessage("Invalid product ID"),
  handleValidation,
];

exports.validateVariantId = [
  param("variantId").isMongoId().withMessage("Invalid variant ID"),
  handleValidation,
];


