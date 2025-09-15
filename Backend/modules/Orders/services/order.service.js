const mongoose = require("mongoose");
const Order = require("../models/order.model");
const OrderItem = require("../models/orderItem.model");
const Address = require("../../Address/models/address.model");
const CustomError = require("../../../utils/CustomError");
const User = require("../../User/models/user.model");

function generateOrderNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${y}${mm}${dd}-${rand}`;
}

async function createOrderForUser(userId, payload) {
  const session = await mongoose.startSession();
  //   session.startTransaction();
  try {
    // Security: Ensure addresses belong to the user
    const shipAddr = await Address.findOne({
      _id: payload.shippingAddress,
      userId,
    });
    if (!shipAddr) {
      throw new CustomError("Invalid shipping address", 400, "InvalidAddress");
    }
    let billAddr = null;
    if (payload.billingAddress) {
      billAddr = await Address.findOne({ _id: payload.billingAddress, userId });
      if (!billAddr) {
        throw new CustomError("Invalid billing address", 400, "InvalidAddress");
      }
    }

    // Prepare order items: compute subtotal per item and persist snapshots
    const itemDocs = [];
    let itemsSubtotal = 0;
    for (const it of payload.items) {
      const subtotal = Number(it.totalPrice);
      itemsSubtotal += subtotal;
      const itemDoc = await OrderItem.create(
        [
          {
            productId: it.productId,
            variantId: it.variantId,
            title: it.title,
            variantName: it.variantName,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            currency: payload.currency || "INR",
            subtotal,
          },
        ],
        { session }
      );
      itemDocs.push(itemDoc[0]._id);
    }

    const shippingFee = Number(payload.shippingFee || 0);
    const tax = Number(payload.tax || 0);
    const orderDiscount = Number(payload.orderDiscount || 0);
    const itemsDiscountTotal = 0; // placeholder if per-item discounts are introduced later

    const grandTotal =
      Math.max(0, itemsSubtotal - itemsDiscountTotal - orderDiscount) +
      shippingFee +
      tax;

    const order = await Order.create(
      [
        {
          orderNumber: generateOrderNumber(),
          userId,
          items: itemDocs,
          currency: payload.currency || "INR",
          itemsSubtotal,
          itemsDiscountTotal,
          orderDiscount,
          shippingFee,
          tax,
          discount: 0,
          grandTotal,
          couponId: payload.couponId,
          shippingAddress: payload.shippingAddress,
          billingAddress: payload.billingAddress || payload.shippingAddress,
          notes: payload.notes,
        },
      ],
      { session }
    );

    const u = await User.findByIdAndUpdate(userId, {
      $push: { orderHistory: { orderId: order[0]._id } },
    });

    // await session.commitTransaction();
    // session.endSession();

    return order[0];
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}

async function updateOrderShippingAddress(userId, orderId, shippingAddressId) {
  // Ensure order belongs to user
  const order = await Order.findById(orderId);
  if (!order) {
    throw new CustomError("Order not found", 404, "OrderNotFound");
  }
  if (String(order.userId) !== String(userId)) {
    throw new CustomError("Unauthorized order access", 403, "Unauthorized");
  }

  // Block updates once shipped or beyond
  if (
    ["shipped", "delivered", "cancelled", "returned"].includes(order.status)
  ) {
    throw new CustomError(
      "Cannot update shipping address after the order has been shipped or finalized",
      400,
      "OrderLocked"
    );
  }

  // Validate address ownership
  const addr = await Address.findOne({ _id: shippingAddressId, userId });
  if (!addr) {
    throw new CustomError("Invalid shipping address", 400, "InvalidAddress");
  }

  order.shippingAddress = shippingAddressId;
  await order.save();
  return order;
}

async function cancelOrder(userId, orderId) {
  const order = await Order.findById(orderId);
  if (!order) throw new CustomError("Order not found", 404, "OrderNotFound");
  if (String(order.userId) !== String(userId)) {
    throw new CustomError("Unauthorized order access", 403, "Unauthorized");
  }
  if (["shipped", "delivered", "returned"].includes(order.status)) {
    throw new CustomError(
      "Cannot cancel an order that is already shipped or completed",
      400,
      "OrderLocked"
    );
  }
  if (order.status === "cancelled") {
    return order; // already cancelled
  }
  order.status = "cancelled";
  await order.save();
  return order;
}

async function listUserOrders(userId, { page = 1, limit = 10 } = {}) {
  page = Math.max(1, Number(page) || 1);
  limit = Math.min(50, Math.max(1, Number(limit) || 10));
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("items")
      .lean(),
    Order.countDocuments({ userId }),
  ]);

  return { orders, page, limit, total, pages: Math.ceil(total / limit) };
}

module.exports = {
  createOrderForUser,
  updateOrderShippingAddress,
  cancelOrder,
  listUserOrders,
};
