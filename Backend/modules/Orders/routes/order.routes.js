const express = require("express");
const router = express.Router();
const authMiddleware = require("../../../middleware/auth.middleware");
const {
  createOrder,
  updateShippingAddress,
  cancelOrderController,
  listOrdersController,
} = require("../controllers/order.controller");
const {
  validateCreateOrder,
  validateUpdateShippingAddress,
  validateOrderIdParam,
} = require("../validation/order.validation");

// Create a new order for the authenticated user
router.post("/create", authMiddleware, validateCreateOrder, createOrder);

// Update order shipping address (only if not shipped yet)
router.put(
  "/:orderId/shipping-address",
  authMiddleware,
  validateUpdateShippingAddress,
  updateShippingAddress
);

// Cancel order (only if not shipped/delivered/returned)
router.put(
  "/:orderId/cancel",
  authMiddleware,
  validateOrderIdParam,
  cancelOrderController
);

// List orders for authenticated user
router.get("/", authMiddleware, listOrdersController);

module.exports = router;
