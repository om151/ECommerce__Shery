import httpClient from "../http";

export const getWishlist = async () => {
  try {
    const response = await httpClient.get("/wishlist");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addToWishlist = async (wishlistData) => {
  try {
    const response = await httpClient.post("/wishlist/add", wishlistData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const removeFromWishlist = async (productId) => {
  try {
    const response = await httpClient.post("/wishlist/remove", { productId });
    return response.data;
  } catch (error) {
    throw error;
  }
};
