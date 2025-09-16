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
    // Prevent duplicate
    const exists = wishlist.products.some(
      (p) => p.productId.toString() === productId.toString()
    );

    if (!exists) {
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

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getUserWishlist,
};

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
        select: "name attributes price compareAtPrice images isDeleted",
      },
    })
    .lean();

  if (!wishlist) {
    return { userId, products: [] };
  }

  // Filter out products that didn't populate due to isDeleted
  const filtered = wishlist.products
    .filter((p) => p.productId)
    .map((p) => ({
      addedAt: p.addedAt,
      product: p.productId,
    }));

  return { _id: wishlist._id, userId: wishlist.userId, products: filtered };
}
