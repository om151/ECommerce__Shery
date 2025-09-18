import httpClient from "../http.js";

export const getProducts = async () => {
  try {
    const response = await httpClient.get("/product");
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const getProductById = async (productId) => {
  try {
    const response = await httpClient.get(`/product/${productId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};