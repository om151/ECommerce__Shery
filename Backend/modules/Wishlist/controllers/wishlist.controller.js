const wishlistService = require("../services/wishlist.service");
const User = require("../../User/models/user.model");
const { Product } = require("../../Product/models/product.model");
const asyncHandler = require("../../../utils/asyncHandler");

exports.addToWishlist = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const { productId } = req.body;
  const product = await Product.findById(productId);
  if (!product) throw new Error("Product not found");

  const wishlist = await wishlistService.addToWishlist(userId, productId);

  // Find the added wishlist item to return to frontend
  const addedItem = wishlist.products.find(
    (p) => p.productId.toString() === productId.toString()
  );

  const wishlistItem = {
    addedAt: addedItem.addedAt,
    product: product,
  };

  res.status(200).json({
    message: "Product added to wishlist",
    wishlist,
    wishlistItem,
  });
});

exports.removeFromWishlist = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { productId } = req.body;
  const product = await Product.findById(productId);
  if (!product) throw new Error("Product not found");
  const wishlist = await wishlistService.removeFromWishlist(userId, productId);
  res.status(200).json({ message: "Product removed from wishlist", wishlist });
});

exports.getMyWishlist = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const wishlist = await wishlistService.getUserWishlist(userId);
  res.status(200).json({ success: true, wishlist });
});
