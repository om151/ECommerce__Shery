import httpClient from "../http.js";

export const getProducts = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    // Add all parameters to query string
    Object.keys(params).forEach((key) => {
      if (
        params[key] !== undefined &&
        params[key] !== null &&
        params[key] !== ""
      ) {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const url = queryString ? `/product?${queryString}` : "/product";

    const response = await httpClient.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProductFilters = async () => {
  try {
    const response = await httpClient.get("/product/filters");
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
