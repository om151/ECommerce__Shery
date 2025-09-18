import httpClient from "../http.js";

export const getProductReviews = async (productId) => {
  try {
    const response = await httpClient.get(`/review/${productId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};