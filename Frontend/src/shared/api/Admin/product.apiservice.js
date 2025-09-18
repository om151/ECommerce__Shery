import httpClient from "../http.js";

export const getAllProducts = async (page = 1, limit = 10) => {
  try {
    const response = await httpClient.get("/product", {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateProduct = async (productId, productData) => {
  try {
    const response = await httpClient.put(`/product/edit/${productId}`, productData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getLowStockProducts = async (threshold = 5) => {
  try {
    const response = await httpClient.get("/product", {
      params: { lowStock: threshold },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};