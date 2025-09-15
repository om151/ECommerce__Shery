const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../../Orders/models/order.model");
const PaymentInfo = require("../models/paymentInfo.model");
const CustomError = require("../../../utils/CustomError");

function getRazorpayInstance() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new CustomError("Razorpay credentials not configured", 500, "ConfigError");
  }
  return new Razorpay({ key_id, key_secret });
}

async function ensureOrderOwnsToUser(orderId, userId) {
  const order = await Order.findById(orderId);
  if (!order) throw new CustomError("Order not found", 404, "OrderNotFound");
  if (String(order.userId) !== String(userId)) {
    throw new CustomError("Unauthorized order access", 403, "Unauthorized");
  }
  return order;
}

async function processCODPayment(userId, orderId) {
  const order = await ensureOrderOwnsToUser(orderId, userId);
  if (order.paymentStatus === "paid") {
    throw new CustomError("Order already paid", 400, "AlreadyPaid");
  }

  // Create or reuse an existing pending COD payment record
  let payment = await PaymentInfo.findOne({ orderId, userId, method: "cod", status: { $in: ["pending", "authorized"] } });
  if (!payment) {
    payment = await PaymentInfo.create({
      orderId,
      userId,
      currency: order.currency || "INR",
      amountRequested: order.grandTotal,
      method: "cod",
      provider: "cod",
      status: "pending",
      referenceId: order.orderNumber,
    });
  }
  // Update order to reflect pending payment
  if (!order.payments) order.payments = [];
  if (!order.payments.find((id) => String(id) === String(payment._id))) {
    order.payments.push(payment._id);
  }
  order.paymentStatus = "pending";
  await order.save();
  return { order, payment };
}

async function initiateRazorpayPayment(userId, orderId, method) {
  const order = await ensureOrderOwnsToUser(orderId, userId);
  if (order.paymentStatus === "paid") {
    throw new CustomError("Order already paid", 400, "AlreadyPaid");
  }
  const instance = getRazorpayInstance();
  const amountPaise = Math.round(Number(order.grandTotal) * 100);
  const rzpOrder = await instance.orders.create({
    amount: amountPaise,
    currency: order.currency || "INR",
    receipt: order.orderNumber,
    notes: { orderId: String(order._id), userId: String(userId) },
  });

  const payment = await PaymentInfo.create({
    orderId,
    userId,
    currency: order.currency || "INR",
    amountRequested: order.grandTotal,
    method, // 'card' or 'upi'
    provider: "razorpay",
    status: "pending",
    transactionId: rzpOrder.id, // store Razorpay order id here for tracking
    referenceId: order.orderNumber,
    meta: { rzpOrder },
  });

  if (!order.payments) order.payments = [];
  order.payments.push(payment._id);
  order.paymentStatus = "pending";
  await order.save();

  return {
    razorpayOrderId: rzpOrder.id,
    amount: amountPaise,
    currency: rzpOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
    order,
    payment,
  };
}

async function verifyRazorpayPayment(userId, orderId, { razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  const order = await ensureOrderOwnsToUser(orderId, userId);
  // find pending payment record by razorpay_order_id
  const payment = await PaymentInfo.findOne({ orderId, userId, provider: "razorpay", transactionId: razorpay_order_id, status: "pending" });
  if (!payment) {
    throw new CustomError("Pending payment not found for this order", 404, "PaymentNotFound");
  }

  const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const expected = hmac.digest("hex");
  if (expected !== razorpay_signature) {
    payment.status = "failed";
    payment.failureReason = "Signature verification failed";
    await payment.save();
    throw new CustomError("Invalid payment signature", 400, "SignatureMismatch");
  }

  // Mark captured
  payment.amountCaptured = payment.amountRequested;
  payment.status = "captured";
  payment.transactionId = razorpay_payment_id; // store actual payment id
  payment.meta = { ...(payment.meta || {}), razorpay_order_id, razorpay_payment_id, razorpay_signature };
  await payment.save();

  order.paymentStatus = "paid";
  await order.save();

  return { order, payment };
}

module.exports = { processCODPayment, initiateRazorpayPayment, verifyRazorpayPayment };
