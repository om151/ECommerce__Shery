const { validationResult } = require("express-validator");
const asyncHandler = require("../../../utils/asyncHandler");
const { createReview, updateReview, deleteReview } = require("../services/review.service");

const createReviewController = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const userId = req.user._id;
  const { productId, orderId, rating, title, comment } = req.body;
  const review = await createReview(userId, { productId, orderId, rating, title, comment });
  return res.status(201).json({ review, message: "Review created" });
});

const updateReviewController = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const userId = req.user._id;
  const { reviewId } = req.params;
  const { rating, title, comment } = req.body;
  const review = await updateReview(userId, reviewId, { rating, title, comment });
  return res.status(200).json({ review, message: "Review updated" });
});

const deleteReviewController = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const userId = req.user._id;
  const { reviewId } = req.params;
  await deleteReview(userId, reviewId);
  return res.status(200).json({ message: "Review deleted" });
});

module.exports = {
  createReviewController,
  updateReviewController,
  deleteReviewController,
};
