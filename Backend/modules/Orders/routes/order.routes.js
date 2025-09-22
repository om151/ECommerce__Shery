const express = require("express");
const router = express.Router();
const authMiddleware = require("../../../middleware/auth.middleware");
const adminMiddleware = require("../../../middleware/adminAuth.middleware");
const {
  createOrder,
  updateShippingAddress,
  cancelOrderController,
  listOrdersController,
  listAllOrdersController,
  getOrderController,
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

// Get single order by ID for authenticated user
router.get(
  "/:orderId",
  authMiddleware,
  validateOrderIdParam,
  getOrderController
);

// Admin: list all orders (paginated)
router.get(
  "/admin/all",
  authMiddleware,
  adminMiddleware,
  listAllOrdersController
);

module.exports = router;
