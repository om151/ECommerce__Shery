import httpClient from "../http.js";

/**
 * Validate a coupon code before applying it
 * @param {string} couponCode - The coupon code to validate
 * @param {number} orderTotal - Total order amount
 * @param {string[]} productIds - Array of product IDs in the order
 * @returns {Promise} API response with validation result
 */
export const validateCoupon = async (
  couponCode,
  orderTotal,
  productIds = []
) => {
  try {
    const requestData = {
      code: couponCode,
      orderTotal,
      productIds,
    };

    console.log(
      "🎟️ API DEBUG - Sending coupon validation request:",
      requestData
    );

    const response = await httpClient.post("/coupon/validate", requestData);

    console.log(
      "🎟️ API DEBUG - Received coupon validation response:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error("🎟️ API DEBUG - Coupon validation error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

/**
 * Apply a coupon to an order (deprecated - use validateCoupon instead)
 * @param {string} couponCode - The coupon code to apply
 * @param {number} orderTotal - Total order amount
 * @returns {Promise} API response
 */
export const applyCoupon = async (couponCode, orderTotal) => {
  try {
    const response = await httpClient.post("/coupon/apply", {
      couponCode,
      orderTotal,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
