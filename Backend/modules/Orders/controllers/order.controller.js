const { validationResult } = require("express-validator");
const asyncHandler = require("../../../utils/asyncHandler");
const {
  createOrderForUser,
  updateOrderShippingAddress,
  cancelOrder,
  listUserOrders,
  listAllOrders,
  listAllOrdersTotalOrders,
  getOrderById,
} = require("../services/order.service");

const createOrder = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.user._id;
  const order = await createOrderForUser(userId, req.body);
  return res.status(201).json({ order });
});

module.exports = { createOrder };

const updateShippingAddress = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { orderId } = req.params;
  const { shippingAddress } = req.body;
  const userId = req.user._id;

  const order = await updateOrderShippingAddress(
    userId,
    orderId,
    shippingAddress
  );
  return res.status(200).json({ order, message: "Shipping address updated" });
});

module.exports.updateShippingAddress = updateShippingAddress;

const cancelOrderController = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { orderId } = req.params;
  const userId = req.user._id;
  const order = await cancelOrder(userId, orderId);
  return res.status(200).json({ order, message: "Order cancelled" });
});

const listOrdersController = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page, limit } = req.query;
  const result = await listUserOrders(userId, { page, limit });
  return res.status(200).json(result);
});

module.exports.cancelOrderController = cancelOrderController;
module.exports.listOrdersController = listOrdersController;

const listAllOrdersController = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  if (!page || !limit) {
    const totalOrders = await listAllOrdersTotalOrders();
    return res.status(200).json({ totalOrders });
  }
  const result = await listAllOrders({ page, limit });
  return res.status(200).json(result);
});

const getOrderController = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { orderId } = req.params;
  const userId = req.user._id;
  const order = await getOrderById(userId, orderId);
  return res.status(200).json({ order });
});

module.exports.getOrderController = getOrderController;

module.exports.listAllOrdersController = listAllOrdersController;
