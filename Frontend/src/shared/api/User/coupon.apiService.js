import httpClient from "../http.js";

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