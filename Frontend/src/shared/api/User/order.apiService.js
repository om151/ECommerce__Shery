import httpClient from "../http.js";

/**
 * Create a new order
 * @param {Object} orderData - Order data including items, addresses, etc.
 * @returns {Promise} API response with created order
 */
export const createOrder = async (orderData) => {
  try {
    console.log("🚀 ORDER API - Sending order data:", orderData);
    const response = await httpClient.post("/order/create", orderData);
    console.log("✅ ORDER API - Response received:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ ORDER API - Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Get user's order history
 * @param {Object} params - Query parameters (page, limit)
 * @returns {Promise} API response with orders array
 */
export const getUserOrders = async (params = {}) => {
  try {
    const response = await httpClient.get("/order", { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get single order by ID
 * @param {string} orderId - Order ID to fetch
 * @returns {Promise} API response with order data
 */
export const getOrderById = async (orderId) => {
  try {
    const response = await httpClient.get(`/order/${orderId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Cancel an order
 * @param {string} orderId - Order ID to cancel
 * @returns {Promise} API response with updated order
 */
export const cancelOrder = async (orderId) => {
  try {
    const response = await httpClient.put(`/order/${orderId}/cancel`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update shipping address for an order
 * @param {string} orderId - Order ID
 * @param {Object} shippingAddress - New shipping address
 * @returns {Promise} API response with updated order
 */
export const updateOrderShipping = async (orderId, shippingAddress) => {
  try {
    const response = await httpClient.put(
      `/order/${orderId}/shipping-address`,
      {
        shippingAddress,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
