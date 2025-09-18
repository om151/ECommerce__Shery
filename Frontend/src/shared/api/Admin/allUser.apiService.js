import httpClient from "../http.js";

export const getAllUsers = async (page = 1, limit = 10) => {
  try {
    const response = await httpClient.get("/user/admin/all", {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};