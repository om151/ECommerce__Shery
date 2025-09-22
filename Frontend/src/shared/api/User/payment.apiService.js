import httpClient from "../http.js";

/**
 * Process payment for an order
 * @param {string} orderId - Order ID
 * @param {string} method - Payment method ('cod', 'card', 'upi')
 * @returns {Promise} API response with payment details
 */
export const processPayment = async (orderId, method) => {
  try {
    const response = await httpClient.post("/payment/process", {
      orderId,
      method,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Verify Razorpay payment
 * @param {string} orderId - Order ID
 * @param {Object} paymentData - Razorpay payment verification data
 * @returns {Promise} API response with verification result
 */
export const verifyPayment = async (orderId, paymentData) => {
  try {
    const response = await httpClient.post("/payment/verify", {
      orderId,
      razorpay_order_id: paymentData.razorpay_order_id,
      razorpay_payment_id: paymentData.razorpay_payment_id,
      razorpay_signature: paymentData.razorpay_signature,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
