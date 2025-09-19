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

export const createCoupon = async (data) => {
  try {
    const response = await httpClient.post("/coupon/create", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const editCoupon = async (couponId, data) => {
  try {
    const response = await httpClient.put(`/coupon/${couponId}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteCoupon = async (couponId) => {
  try {
    const response = await httpClient.delete(`/coupon/${couponId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
