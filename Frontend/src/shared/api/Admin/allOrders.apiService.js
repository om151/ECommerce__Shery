import httpClient from "../http.js";


export const getAllOrders = async (page = 1, limit = 10) => {
  try {
    const response = await httpClient.get("/order/admin/all", {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getRecentOrders = async (limit = 10) => {
  try {
    const response = await httpClient.get("/order/admin/all", {
      params: { page: 1, limit, sort: "createdAt", order: "desc" },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const loginUser = async (credentials) => {
  try {
    const response = await httpClient.post("/user/login", credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};