import httpClient from "../http.js";

export const getAllUsers = async () => {
  try {
    const response = await httpClient.get("/user/admin/all");
    return response.data;
  } catch (error) {
    throw error;
  }
};