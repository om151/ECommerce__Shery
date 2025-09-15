const express = require("express");
const router = express.Router();
const authMiddleware = require("../../../middleware/auth.middleware");
const { processPayment, verifyPayment } = require("../controllers/payment.controller");
const { validateProcessPayment, validateVerifyPayment } = require("../validation/payment.validation");

// Initiate payment (COD => create payment record; card/upi => create Razorpay order)
router.post("/process", authMiddleware, validateProcessPayment, processPayment);

// Verify Razorpay payment after client completes checkout
router.post("/verify", authMiddleware, validateVerifyPayment, verifyPayment);

module.exports = router;
