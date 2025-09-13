const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlist.controller");
const {
  validateAddToWishlist,
  validateRemoveFromWishlist,
} = require("../validation/wishlist.validation");
const authMiddleware = require("../../../middleware/auth.middleware");

// Add product to wishlist
router.post("/add", authMiddleware, validateAddToWishlist, wishlistController.addToWishlist);

// Remove product from wishlist
router.post(
  "/remove",
  authMiddleware,
  validateRemoveFromWishlist,
  wishlistController.removeFromWishlist
);

module.exports = router;
