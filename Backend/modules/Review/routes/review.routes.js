const express = require("express");
const router = express.Router();
const authMiddleware = require("../../../middleware/auth.middleware");
const {
  createReviewController,
  updateReviewController,
  deleteReviewController,
} = require("../controllers/review.controller");
const {
  validateCreateReview,
  validateUpdateReview,
  validateDeleteReview,
} = require("../validation/review.validation");

// Create a review
router.post("/", authMiddleware, validateCreateReview, createReviewController);

// Edit a review
router.put("/:reviewId", authMiddleware, validateUpdateReview, updateReviewController);

// Delete a review
router.delete("/:reviewId", authMiddleware, validateDeleteReview, deleteReviewController);

module.exports = router;
