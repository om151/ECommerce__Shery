const { validationResult } = require("express-validator");
const asyncHandler = require("../../../utils/asyncHandler");
const { processCODPayment, initiateRazorpayPayment, verifyRazorpayPayment } = require("../services/payment.service");

const processPayment = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { orderId, method } = req.body;
  const userId = req.user._id;

  if (method === "cod") {
    const { order, payment } = await processCODPayment(userId, orderId);
    return res.status(201).json({ order, payment, message: "COD payment created" });
  }

  // card or upi -> Razorpay
  const result = await initiateRazorpayPayment(userId, orderId, method);
  return res.status(201).json({ ...result, message: "Razorpay order created" });
});

const verifyPayment = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const userId = req.user._id;
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const { order, payment } = await verifyRazorpayPayment(userId, orderId, {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });

  return res.status(200).json({ order, payment, message: "Payment verified and captured" });
});

module.exports = { processPayment, verifyPayment };
