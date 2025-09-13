const asyncHandler = require("../../utils/asyncHandler");
const cartService = require("../services/cart.service");

exports.addToCart = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { productId, variantId, quantity } = req.body;
  const cart = await cartService.addToCart(
    userId,
    productId,
    variantId,
    quantity
  );
  res.status(200).json({ message: "Product added to cart", cart });
});

exports.editCart = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { productId, variantId, quantity } = req.body;
  const cart = await cartService.editCart(
    userId,
    productId,
    variantId,
    quantity
  );
  res.status(200).json({ message: "Cart updated", cart });
});

exports.removeFromCart = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { productId, variantId } = req.body;
  const cart = await cartService.removeFromCart(userId, productId, variantId);
  res.status(200).json({ message: "Product removed from cart", cart });
});

exports.getCart = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const cart = await cartService.getCart(userId);
  res.status(200).json({ cart });
});
