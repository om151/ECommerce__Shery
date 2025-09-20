const { Product, ProductVariant } = require("../models/product.model");
const Inventory = require("../models/inventory.model");
const Review = require("../../Review/review.model"); // Adjust path if needed
const mongoose = require("mongoose");

// --- Edit Product ---
async function editProductService(productId, updateData, files) {
  const product = await Product.findById(productId);
  if (!product) throw new Error("Product not found");

  // Update fields if present
  if (updateData.title) product.title = updateData.title;
  if (updateData.description) product.description = updateData.description;
  if (updateData.categories) product.categories = updateData.categories;
  if (updateData.attributes && updateData.attributes.brand)
    product.attributes.brand = updateData.attributes.brand;
  if (updateData.searchKeywords)
    product.searchKeywords = updateData.searchKeywords;

  // Optionally handle product-level images here if you have such a field

  product.updatedAt = Date.now();
  await product.save();
  return product;
}

// --- List All Products (non-deleted) with non-deleted variants and pagination ---
async function listAllProductsService(page = 1, limit = 20, options = {}) {
  const skip = (page - 1) * limit;
  const baseQuery = { isDeleted: { $ne: true } };

  // Build search query
  if (options.search) {
    const searchRegex = new RegExp(options.search, "i");
    baseQuery.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { searchKeywords: { $in: [searchRegex] } },
      { "attributes.brand": searchRegex },
    ];
  }

  // Add category filter
  if (options.category) {
    baseQuery.categories = { $in: [options.category] };
  }

  // Add brand filter
  if (options.brand) {
    baseQuery["attributes.brand"] = new RegExp(options.brand, "i");
  }

  // Build sort options
  const sortOptions = {};
  if (options.sortBy === "price") {
    // We'll sort by the minimum price of variants after population
    sortOptions["variants.price"] = options.sortOrder === "asc" ? 1 : -1;
  } else {
    sortOptions[options.sortBy] = options.sortOrder === "asc" ? 1 : -1;
  }

  let products = await Product.find(baseQuery)
    .populate({
      path: "variants",
      match: { isDeleted: { $ne: true } },
      populate: {
        path: "inventoryId",
        model: "Inventory",
      },
    })
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  // Apply post-query filters
  products = products.filter((product) => {
    // Filter out products with no variants
    if (!product.variants || product.variants.length === 0) return false;

    // Filter by stock status
    if (options.inStock !== undefined) {
      const hasStock = product.variants.some(
        (v) => v.inventoryId && v.inventoryId.quantityAvailable > 0
      );
      if (options.inStock && !hasStock) return false;
      if (!options.inStock && hasStock) return false;
    }

    // Filter by low stock
    if (options.lowStock !== undefined) {
      const hasLowStock = product.variants.some(
        (v) =>
          v.inventoryId && v.inventoryId.quantityAvailable <= options.lowStock
      );
      if (!hasLowStock) return false;
    }

    // Filter by price range
    if (options.minPrice !== undefined || options.maxPrice !== undefined) {
      const prices = product.variants
        .map((v) => v.price)
        .filter((p) => p !== undefined);
      if (prices.length === 0) return false;

      const minProductPrice = Math.min(...prices);
      const maxProductPrice = Math.max(...prices);

      if (options.minPrice !== undefined && maxProductPrice < options.minPrice)
        return false;
      if (options.maxPrice !== undefined && minProductPrice > options.maxPrice)
        return false;
    }

    // Filter by color
    if (options.color) {
      const hasColor = product.variants.some(
        (v) =>
          v.attributes &&
          v.attributes.color &&
          v.attributes.color.toLowerCase().includes(options.color.toLowerCase())
      );
      if (!hasColor) return false;
    }

    // Filter by size
    if (options.size) {
      const hasSize = product.variants.some(
        (v) =>
          v.attributes &&
          v.attributes.size &&
          v.attributes.size.toLowerCase().includes(options.size.toLowerCase())
      );
      if (!hasSize) return false;
    }

    return true;
  });

  // Sort by price if requested (post-filter sort)
  if (options.sortBy === "price") {
    products.sort((a, b) => {
      const aPrices = a.variants
        .map((v) => v.price)
        .filter((p) => p !== undefined);
      const bPrices = b.variants
        .map((v) => v.price)
        .filter((p) => p !== undefined);

      const aMinPrice = aPrices.length > 0 ? Math.min(...aPrices) : 0;
      const bMinPrice = bPrices.length > 0 ? Math.min(...bPrices) : 0;

      return options.sortOrder === "asc"
        ? aMinPrice - bMinPrice
        : bMinPrice - aMinPrice;
    });
  }

  // Calculate total for pagination
  const totalQuery = { ...baseQuery };
  if (options.search) {
    const searchRegex = new RegExp(options.search, "i");
    totalQuery.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { searchKeywords: { $in: [searchRegex] } },
      { "attributes.brand": searchRegex },
    ];
  }

  const total = await Product.countDocuments(totalQuery);
  const totalPages = Math.ceil(total / limit);

  return {
    products,
    total,
    currentPage: parseInt(page),
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

// --- Get Product Filters (categories, brands, colors, sizes, price range) ---
async function getProductFiltersService() {
  try {
    const products = await Product.find({ isDeleted: { $ne: true } })
      .populate({
        path: "variants",
        match: { isDeleted: { $ne: true } },
        select: "attributes price",
      })
      .select("categories attributes")
      .lean();

    const categories = new Set();
    const brands = new Set();
    const colors = new Set();
    const sizes = new Set();
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    products.forEach((product) => {
      // Collect categories
      if (product.categories) {
        product.categories.forEach((cat) => categories.add(cat));
      }

      // Collect brands
      if (product.attributes && product.attributes.brand) {
        brands.add(product.attributes.brand);
      }

      // Collect variant-specific data
      if (product.variants) {
        product.variants.forEach((variant) => {
          // Collect colors
          if (variant.attributes && variant.attributes.color) {
            colors.add(variant.attributes.color);
          }

          // Collect sizes
          if (variant.attributes && variant.attributes.size) {
            sizes.add(variant.attributes.size);
          }

          // Track price range
          if (variant.price) {
            minPrice = Math.min(minPrice, variant.price);
            maxPrice = Math.max(maxPrice, variant.price);
          }
        });
      }
    });

    return {
      categories: Array.from(categories).sort(),
      brands: Array.from(brands).sort(),
      colors: Array.from(colors).sort(),
      sizes: Array.from(sizes).sort(),
      priceRange: {
        min: minPrice === Infinity ? 0 : minPrice,
        max: maxPrice === -Infinity ? 0 : maxPrice,
      },
    };
  } catch (error) {
    throw new Error("Failed to fetch product filters: " + error.message);
  }
}

// --- Edit Variant ---
async function editVariantService(variantId, updateData, files) {
  const variant = await ProductVariant.findById(variantId);
  if (!variant) throw new Error("Variant not found");

  if (updateData.name) variant.name = updateData.name;
  if (updateData.attributes) {
    if (updateData.attributes.color)
      variant.attributes.color = updateData.attributes.color;
    if (updateData.attributes.size)
      variant.attributes.size = updateData.attributes.size;
  }
  if (updateData.price) variant.price = updateData.price;
  if (updateData.compareAtPrice)
    variant.compareAtPrice = updateData.compareAtPrice;

  // Handle images
  if (files && files.length > 0) {
    variant.images = files.map((f) => f.path);
  }

  if (updateData.quantityAvailable !== undefined) {
    const inventory = await Inventory.findById(variant.inventoryId);
    if (inventory) {
      inventory.quantityAvailable = updateData.quantityAvailable;
      await inventory.save();
    }
  }

  await variant.save();
  return variant;
}

// --- Add New Variant to Product ---
async function addVariantToProductService(productId, variantData, files) {
  const product = await Product.findById(productId);
  if (!product) throw new Error("Product not found");

  // Create inventory for the new variant
  const inventory = await Inventory.create({
    productId: product._id,
    variantId: null,
    reservedQuantity: 0,
    quantityAvailable: variantData.quantityAvailable,
  });

  // Create the variant
  const newVariant = await ProductVariant.create({
    name: variantData.name,
    attributes: variantData.attributes,
    price: variantData.price,
    compareAtPrice: variantData.compareAtPrice,
    images: files.map((f) => f.path),
    inventoryId: inventory._id,
    productId: product._id,
  });

  // Update inventory with variantId
  inventory.variantId = newVariant._id;
  await inventory.save();

  // Add variant to product
  product.variants.push(newVariant._id);
  await product.save();

  return newVariant;
}

// --- Already present: Add Product with Variants ---
async function addProductWithVariantsService({
  title,
  description,
  categories,
  attributes,
  searchKeywords,
  variants,
  files,
}) {
  // Map uploaded images to variants
  let imageMap = {};
  (files || []).forEach((file) => {
    let key = null;
    // Preferred: fieldname like `images_<tempId>`; take everything after the prefix to preserve underscores in tempId
    if (file.fieldname && file.fieldname.startsWith("images_")) {
      key = file.fieldname.slice("images_".length);
    }
    // Backward-compatible fallback: originalname like `${tempId}_filename.ext` (note: ambiguous if tempId contains underscores)
    if (!key && file.originalname && file.originalname.includes("_")) {
      key = file.originalname.split("_")[0];
    }
    if (key) {
      if (!imageMap[key]) imageMap[key] = [];
      imageMap[key].push(file.path);
    }
  });

  const productVariants = [];
  const createdInventoryIds = [];
  const createdVariantIds = [];
  for (const variant of variants) {
    // Use a unique placeholder for variantId to satisfy the unique index (productId, variantId)
    const placeholderVariantId = new mongoose.Types.ObjectId();

    const inventory = await Inventory.create({
      productId: null,
      variantId: placeholderVariantId,
      reservedQuantity: 0,
      quantityAvailable: variant.quantityAvailable,
    });

    const createdVariant = await ProductVariant.create({
      name: variant.name,
      attributes: variant.attributes,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      images: imageMap[variant.tempId] || [],
      inventoryId: inventory._id,
      productId: null, // Will set after product creation
    });

    await Inventory.findByIdAndUpdate(inventory._id, {
      $set: { variantId: createdVariant._id },
    });

    productVariants.push(createdVariant._id);
    createdVariantIds.push(createdVariant._id);
    createdInventoryIds.push(inventory._id);
  }

  const product = await Product.create({
    title,
    description,
    categories,
    attributes,
    variants: productVariants,
    searchKeywords,
  });

  if (createdInventoryIds.length > 0) {
    await Inventory.updateMany(
      { _id: { $in: createdInventoryIds } },
      { $set: { productId: product._id } }
    );
  }

  if (createdVariantIds.length > 0) {
    await ProductVariant.updateMany(
      { _id: { $in: createdVariantIds } },
      { $set: { productId: product._id } }
    );
  }

  return product;
}

// --- Delete Variant from Product ---
async function deleteVariantFromProductService(variantId) {
  const variant = await ProductVariant.findById(variantId);
  if (!variant) throw new Error("Variant not found");
  if (variant.isDeleted) {
    throw new Error("Variant already deleted");
  }
  // Remove variant from all products' variants arrays
  await ProductVariant.findByIdAndUpdate(variantId, { isDeleted: true });

  // Delete inventory for this variant
  //   await Inventory.findByIdAndUpdate(variantId, { isDeleted: true });
  await Inventory.findOneAndUpdate({ variantId }, { quantityAvailable: 0 });
}

// --- Delete Product (and all its variants, inventories, reviews) ---
async function deleteProductService(productId) {
  const product = await Product.findById(productId);
  if (!product) throw new Error("Product not found");

  if (product.isDeleted) {
    throw new Error("Product already deleted");
  }

  // Delete all variants and their inventories
  for (const variantId of product.variants) {
    // await Inventory.findOneAndUpdate({ variantId }, { isDeleted: true });
    await Inventory.findOneAndUpdate({ variantId }, { quantityAvailable: 0 });
    await ProductVariant.findByIdAndUpdate(variantId, { isDeleted: true });
  }

  // Delete all reviews for this product
  //   await Review.deleteMany({ product: productId });

  // Delete the product itself
  await Product.findByIdAndUpdate(productId, { isDeleted: true });
}

module.exports = {
  addProductWithVariantsService,
  editProductService,
  editVariantService,
  addVariantToProductService,
  deleteVariantFromProductService,
  deleteProductService,
  listAllProductsService,
  getProductFiltersService,
};
