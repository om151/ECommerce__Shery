const { Product, ProductVariant } = require("../models/product.model");
const Inventory = require("../models/inventory.model");
const Review = require("../../Review/review.model"); // Adjust path if needed

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
async function listAllProductsService(page = 1, limit = 10, options = {}) {
  const skip = (page - 1) * limit;
  const baseQuery = { isDeleted: { $ne: true } };

  let products = await Product.find(baseQuery)
    .populate({
      path: "variants",
      match: { isDeleted: { $ne: true } },
      populate: {
        path: "inventoryId",
        model: "Inventory",
      },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  // Filter by low stock if requested
  if (options.lowStock !== undefined) {
    const threshold = options.lowStock;
    products = products.filter(product =>
      product.variants.some(
        v => v.inventoryId && v.inventoryId.quantityAvailable <= threshold
      )
    );
  }

  // Get total count for pagination (after filtering if lowStock is used)
  let total;
  if (options.lowStock !== undefined) {
    total = products.length;
  } else {
    total = await Product.countDocuments(baseQuery);
  }
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

  if(updateData.quantityAvailable !== undefined){
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
  files.forEach((file) => {
    const [variantId] = file.originalname.split("_");
    if (!imageMap[variantId]) imageMap[variantId] = [];
    imageMap[variantId].push(file.path);
  });

  const productVariants = [];
  for (const variant of variants) {
    const inventory = await Inventory.create({
      productId: null,
      variantId: null,
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

    inventory.variantId = createdVariant._id;
    await inventory.save();

    productVariants.push(createdVariant._id);
  }

  const product = await Product.create({
    title,
    description,
    categories,
    attributes,
    variants: productVariants,
    searchKeywords,
  });

  await Inventory.updateMany(
    { productId: null },
    { $set: { productId: product._id } }
  );

  await ProductVariant.updateMany(
    { productId: null },
    { $set: { productId: product._id } }
  );

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
};
