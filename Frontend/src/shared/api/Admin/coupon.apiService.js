import httpClient from "../http.js";

export const getAllCoupons = async (page = 1, limit = 10) => {
  try {
    const response = await httpClient.get("/coupon", {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

