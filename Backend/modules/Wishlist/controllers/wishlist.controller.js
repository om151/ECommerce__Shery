const wishlistService = require("../services/wishlist.service");
const User = require("../../User/models/user.model");
const {Product} = require("../../Product/models/product.model");

exports.addToWishlist = async (req, res, next) => {
  try {
   
    const userId = req.user._id;

    const { productId } = req.body;
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");
    const wishlist = await wishlistService.addToWishlist(userId, productId);
    res.status(200).json({ message: "Product added to wishlist", wishlist });
  } catch (err) {
    next(err);
  }
};

exports.removeFromWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");
    const wishlist = await wishlistService.removeFromWishlist(
      userId,
      productId
    );
    res
      .status(200)
      .json({ message: "Product removed from wishlist", wishlist });
  } catch (err) {
    next(err);
  }
};
