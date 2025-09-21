const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");
const {
  validateAddToCart,
  validateEditCart,
  validateRemoveFromCart,
} = require("../validation/cart.validation");
const authMiddleware = require("../../../middleware/auth.middleware");

// Add product to cart
router.post(
  "/add",
  authMiddleware,
  validateAddToCart,
  cartController.addToCart
);

// Edit product quantity in cart
router.put("/edit", authMiddleware, validateEditCart, cartController.editCart);

// Remove product from cart
router.post(
  "/remove",
  authMiddleware,
  validateRemoveFromCart,
  cartController.removeFromCart
);

// Get cart for user
router.get("/", authMiddleware, cartController.getCart);

// Clear entire cart
router.delete("/clear", authMiddleware, cartController.clearCart);

module.exports = router;
