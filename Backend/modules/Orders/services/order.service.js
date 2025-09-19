const mongoose = require("mongoose");
const Order = require("../models/order.model");
const OrderItem = require("../models/orderItem.model");
const Address = require("../../Address/models/address.model");
const CustomError = require("../../../utils/CustomError");
const User = require("../../User/models/user.model");
const Coupon = require("../../Coupon/models/coupon.model");
const { validateCoupon } = require("../../Coupon/services/coupon.service");
const Inventory = require("../../Product/models/inventory.model");
const { ProductVariant } = require("../../Product/models/product.model");
const CouponUsage = require("../../Coupon/models/couponUsages.model");

function generateOrderNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${y}${mm}${dd}-${rand}`;
}

async function createOrderForUser(userId, payload) {
  // const session = await mongoose.startSession();
  // await session.startTransaction();
  try {
    // Security: Ensure addresses belong to the user
    const shipAddr = await Address.findOne({
      _id: payload.shippingAddress,
      userId,
    });
    // .session(session);
    if (!shipAddr) {
      throw new CustomError("Invalid shipping address", 400, "InvalidAddress");
    }
    let billAddr = null;
    if (payload.billingAddress) {
      billAddr = await Address.findOne({
        _id: payload.billingAddress,
        userId,
      });
      // .session(session);
      if (!billAddr) {
        throw new CustomError("Invalid billing address", 400, "InvalidAddress");
      }
    }

    // Prepare order items: verify inventory and price, compute subtotal per item and persist snapshots
    const itemDocs = [];
    let itemsSubtotal = 0;
    const inventoryDecrements = [];
    for (const it of payload.items) {
      const quantity = Number(it.quantity);
      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new CustomError("Invalid item quantity", 400, "InvalidQuantity");
      }

      // Check inventory availability for the product/variant
      const inv = await Inventory.findOne({
        productId: it.productId,
        variantId: it.variantId || null,
      });
      // .session(session);
      if (!inv) {
        throw new CustomError(
          "Inventory record not found for item",
          400,
          "InventoryMissing"
        );
      }
      if (quantity > Number(inv.quantityAvailable)) {
        throw new CustomError(
          `Insufficient stock. Available: ${inv.quantityAvailable}, requested: ${quantity}`,
          400,
          "InsufficientInventory"
        );
      }

      // Determine authoritative unit price and validate client totals
      let serverUnitPrice = Number(it.unitPrice);
      const epsilon = 0.01;
      if (it.variantId) {
        const variant = await ProductVariant.findById(it.variantId);
        // .session(
        //   session
        // );
        if (!variant) {
          throw new CustomError("Variant not found", 400, "InvalidVariant");
        }
        if (String(variant.productId) !== String(it.productId)) {
          throw new CustomError(
            "Variant does not belong to the specified product",
            400,
            "VariantProductMismatch"
          );
        }
        serverUnitPrice = Number(variant.price);
        // Validate client unitPrice and totalPrice against server price
        if (
          it.unitPrice !== undefined &&
          Math.abs(Number(it.unitPrice) - serverUnitPrice) > epsilon
        ) {
          throw new CustomError(
            "Unit price mismatch with catalog",
            400,
            "UnitPriceMismatch"
          );
        }
        const expectedSubtotal = serverUnitPrice * quantity;
        if (
          it.totalPrice !== undefined &&
          Math.abs(Number(it.totalPrice) - expectedSubtotal) > epsilon
        ) {
          throw new CustomError(
            `Total price mismatch with catalog ${expectedSubtotal}`,
            400,
            "TotalPriceMismatch"
          );
        }
      } else {
        // No variant info: at least ensure consistency of provided unitPrice and totalPrice
        if (
          it.totalPrice !== undefined &&
          Math.abs(Number(it.totalPrice) - Number(it.unitPrice) * quantity) >
            epsilon
        ) {
          throw new CustomError(
            "Total price does not equal unitPrice * quantity",
            400,
            "ClientTotalInconsistent"
          );
        }
      }

      const subtotal = serverUnitPrice * quantity;
      itemsSubtotal += subtotal;
      // Queue inventory decrement to apply after order creation
      inventoryDecrements.push({
        productId: it.productId,
        variantId: it.variantId || null,
        quantity,
      });
      const itemDoc = await OrderItem.create(
        [
          {
            productId: it.productId,
            variantId: it.variantId,
            title: it.title,
            variantName: it.variantName,
            quantity,
            unitPrice: serverUnitPrice,
            currency: payload.currency || "INR",
            subtotal,
          },
        ]
        // { session }
      );
      itemDocs.push(itemDoc[0]._id);
    }

    const shippingFee = Number(payload.shippingFee || 0);
    const tax = Number(payload.tax || 0);
    let orderDiscount = 0;
    const clientOrderDiscount =
      payload.orderDiscount !== undefined
        ? Number(payload.orderDiscount)
        : undefined;
    const itemsDiscountTotal = 0; // placeholder if per-item discounts are introduced later

    // Coupon validation: recompute discount server-side and ensure client-provided value (if any) matches
    const couponCode = payload.couponCode && String(payload.couponCode).trim();
    const productIdsInOrder = new Set(
      (payload.items || []).map((it) => String(it.productId))
    );
    const productIdsArr = Array.from(productIdsInOrder).map(
      (id) => new mongoose.Types.ObjectId(id)
    );
    let appliedCouponId = null;
    if (couponCode || payload.couponId) {
      let couponDocByCode = null;
      let couponDocById = null;
      if (couponCode) {
        couponDocByCode = await Coupon.findOne({
          code: couponCode.toUpperCase(),
        });
        // .session(session);
      }
      if (payload.couponId) {
        couponDocById = await Coupon.findById(payload.couponId);
        // .session(session);
      }
      const couponDoc = couponDocByCode || couponDocById;
      if (!couponDoc) {
        throw new CustomError("Invalid coupon", 400, "InvalidCoupon");
      }
      if (
        couponDocByCode &&
        couponDocById &&
        String(couponDocByCode._id) !== String(couponDocById._id)
      ) {
        throw new CustomError(
          "couponCode and couponId refer to different coupons",
          400,
          "CouponMismatch"
        );
      }

      const validation = await validateCoupon({
        code: couponDoc.code,
        userId,
        orderTotal: itemsSubtotal,
        productIds: productIdsArr,
      });
      if (!validation.valid) {
        throw new CustomError(
          validation.message || "Invalid coupon",
          400,
          "InvalidCoupon"
        );
      }
      orderDiscount = Number(validation.discountAmount || 0);
      appliedCouponId = couponDoc._id;

      // if (clientOrderDiscount !== undefined) {
      //   const epsilon = 0.01;
      //   if (Math.abs(clientOrderDiscount - orderDiscount) > epsilon) {
      //     throw new CustomError(
      //       "Order discount does not match coupon calculation",
      //       400,
      //       "DiscountMismatch"
      //     );
      //   }
      // }
    }

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
          couponId: appliedCouponId,
          shippingAddress: payload.shippingAddress,
          billingAddress: payload.billingAddress || payload.shippingAddress,
          notes: payload.notes,
        },
      ]
      // { session }
    );

   

    if (appliedCouponId) {

       Coupon.findByIdAndUpdate(
      appliedCouponId,
      { $inc: { usageCount: 1 } }
      // { session }
    ).exec();

    
      CouponUsage.create(
        [
          {
            couponId: appliedCouponId,
            userId,
            orderId: order[0]._id,
            discountAmount: orderDiscount,
            usedAt: new Date(),
          },
        ]
        // { session }
      );
    }

    // Deduct inventory atomically with conditional guard to avoid race conditions
    for (const dec of inventoryDecrements) {
      const res = await Inventory.updateOne(
        {
          productId: dec.productId,
          variantId: dec.variantId,
          quantityAvailable: { $gte: dec.quantity },
        },
        { $inc: { quantityAvailable: -dec.quantity } }
        // { session }
      );
      if (res.matchedCount !== 1 || res.modifiedCount !== 1) {
        throw new CustomError(
          "Failed to deduct inventory due to concurrent update",
          409,
          "InventoryRace"
        );
      }
    }

    await User.findByIdAndUpdate(
      userId,
      { $push: { orderHistory: { orderId: order[0]._id } } }
      // { session }
    );

    // await session.commitTransaction();
    // session.endSession();

    return order[0];
  } catch (err) {
    // await session.abortTransaction();
    // session.endSession();
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

// Admin: list all orders (paginated)
async function listAllOrders({ page = 1, limit = 10 } = {}) {
  page = Math.max(1, Number(page) || 1);
  limit = Math.min(100, Math.max(1, Number(limit) || 10));
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("items")
      .populate("userId", "name email")
      .lean(),
    Order.countDocuments({}),
  ]);

  return { orders, page, limit, total, pages: Math.ceil(total / limit) };
}

module.exports = {
  createOrderForUser,
  updateOrderShippingAddress,
  cancelOrder,
  listUserOrders,
  listAllOrders,
};
