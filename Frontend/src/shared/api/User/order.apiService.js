import httpClient from "../http.js";

export const createOrder = async (orderData) => {
  try {
    const response = await httpClient.post("/order", orderData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get user's order history
 * @returns {Promise} API response with orders array
 */
export const getUserOrders = async () => {
  try {
    const response = await httpClient.get("/order");
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
