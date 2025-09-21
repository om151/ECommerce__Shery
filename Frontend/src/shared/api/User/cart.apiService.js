import httpClient from "../http.js";

export const getCart = async () => {
  try {
    const response = await httpClient.get("/cart");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addToCart = async (cartItem) => {
  try {
    const response = await httpClient.post("/cart/add", cartItem);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateCartItem = async (updateData) => {
  try {
    const response = await httpClient.put("/cart/edit", updateData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const removeFromCart = async (removeData) => {
  try {
    const response = await httpClient.post("/cart/remove", removeData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const clearCart = async () => {
  try {
    const response = await httpClient.delete("/cart/clear");
    return response.data;
  } catch (error) {
    throw error;
  }
};
