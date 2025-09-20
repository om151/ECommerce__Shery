const { response } = require("../../../app");
const User = require("../../User/models/user.model");
const Wishlist = require("../models/wishlist.model");
const { Product } = require("../../Product/models/product.model");

// Add product to wishlist
async function addToWishlist(userId, productId) {
  let wishlist = await Wishlist.findOne({ userId });

  if (!wishlist) {
    wishlist = await Wishlist.create({ userId, products: [{ productId }] });
    await User.findByIdAndUpdate(userId, {
      $set: { wishlist: wishlist._id },
    }).exec();
  } else {
    // Clean up any deleted/non-existent products first
    const validProductIds = [];

    for (const product of wishlist.products) {
      try {
        const existingProduct = await Product.findById(product.productId);
        if (existingProduct && !existingProduct.isDeleted) {
          validProductIds.push(product.productId.toString());
        }
      } catch (error) {
        // Product doesn't exist, skip it
        continue;
      }
    }

    // Check if the product we're trying to add already exists in valid products
    const exists = validProductIds.includes(productId.toString());

    if (!exists) {
      // Verify the product we're adding exists and isn't deleted
      const productToAdd = await Product.findById(productId);
      if (!productToAdd || productToAdd.isDeleted) {
        throw new Error("Product not found or has been deleted");
      }

      // Clean the wishlist to only contain valid products and add the new one
      wishlist.products = wishlist.products.filter((p) =>
        validProductIds.includes(p.productId.toString())
      );
      wishlist.products.push({ productId });
      await wishlist.save();
    } else {
      throw new Error("Product already in wishlist");
    }
  }
  return wishlist;
}

// Remove product from wishlist
async function removeFromWishlist(userId, productId) {
  const wishlist = await Wishlist.findOne({ userId });
  if (!wishlist) throw new Error("Wishlist not found");

  const index = wishlist.products.findIndex(
    (p) => p.productId.toString() === productId.toString()
  );

  if (index === -1) {
    throw new Error("Product not found in wishlist");
  }

  wishlist.products.splice(index, 1);
  await wishlist.save();
  return wishlist;
}

// Get wishlist for a user
async function getUserWishlist(userId) {
  const wishlist = await Wishlist.findOne({ userId })
    .populate({
      path: "products.productId",
      model: "Product",
      match: { isDeleted: { $ne: true } },
      select:
        "title description categories attributes rating variants isDeleted",
      populate: {
        path: "variants",
        model: "ProductVariant",
        match: { isDeleted: { $ne: true } },
        select:
          "name attributes price compareAtPrice images inventoryId isDeleted",
        populate: {
          path: "inventoryId",
          model: "Inventory",
          select: "quantityAvailable reservedQuantity",
        },
      },
    })
    .lean();

  if (!wishlist) {
    return { userId, products: [] };
  }

  // Filter out products that didn't populate due to isDeleted or non-existence
  const filtered = wishlist.products
    .filter((p) => p.productId)
    .map((p) => ({
      addedAt: p.addedAt,
      product: p.productId,
    }));

  return { _id: wishlist._id, userId: wishlist.userId, products: filtered };
}

// Helper function to clean up deleted products from wishlist
async function cleanupWishlist(userId) {
  const wishlist = await Wishlist.findOne({ userId });
  if (!wishlist) return;

  const validProducts = [];
  for (const product of wishlist.products) {
    try {
      const existingProduct = await Product.findById(product.productId);
      if (existingProduct && !existingProduct.isDeleted) {
        validProducts.push(product);
      }
    } catch (error) {
      // Product doesn't exist, skip it
      continue;
    }
  }

  if (validProducts.length !== wishlist.products.length) {
    wishlist.products = validProducts;
    await wishlist.save();
  }

  return wishlist;
}

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getUserWishlist,
  cleanupWishlist,
};
