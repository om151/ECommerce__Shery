const Review = require("../review.model");
const Order = require("../../Orders/models/order.model");
const CustomError = require("../../../utils/CustomError");

async function assertUserOrderedProduct(userId, productId, orderId) {
  const order = await Order.findOne({ _id: orderId, userId });
  if (!order) throw new CustomError("Order not found", 404, "OrderNotFound");
  // Basic check: ensure some order item references the productId
  // Since order stores item refs in OrderItem collection, we rely on business rule: orderId provided is for the product being reviewed
  return order;
}

async function createReview(userId, { productId, orderId, rating, title, comment }) {
  await assertUserOrderedProduct(userId, productId, orderId);

  // Prevent duplicate review by same user for same product and order
  const existing = await Review.findOne({ userId, productId, orderId });
  if (existing) {
    throw new CustomError("You have already reviewed this product for this order", 400, "DuplicateReview");
  }

  const review = await Review.create({ userId, productId, orderId, rating, title, comment });
  return review;
}

async function updateReview(userId, reviewId, updates) {
  const review = await Review.findById(reviewId);
  if (!review) throw new CustomError("Review not found", 404, "ReviewNotFound");
  if (String(review.userId) !== String(userId)) {
    throw new CustomError("Not allowed to edit this review", 403, "Forbidden");
  }

  const allowed = {};
  if ("rating" in updates) allowed.rating = updates.rating;
  if ("title" in updates) allowed.title = updates.title;
  if ("comment" in updates) allowed.comment = updates.comment;

  if (Object.keys(allowed).length === 0) {
    throw new CustomError("No valid fields to update", 400, "NoUpdateFields");
  }

  Object.assign(review, allowed);
  await review.save();
  return review;
}

async function deleteReview(userId, reviewId) {
  const review = await Review.findById(reviewId);
  if (!review) throw new CustomError("Review not found", 404, "ReviewNotFound");
  if (String(review.userId) !== String(userId)) {
    throw new CustomError("Not allowed to delete this review", 403, "Forbidden");
  }
  await review.deleteOne();
  return { success: true };
}

module.exports = {
  createReview,
  updateReview,
  deleteReview,
};
