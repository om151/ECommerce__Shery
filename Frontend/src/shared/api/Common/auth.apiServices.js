import httpClient from "../http.js";


export const registerUser = async (userData) => {
  try {
    const response = await httpClient.post("/user/register", userData);
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

export const getUserProfile = async () => {
  try {
    const response = await httpClient.get("/user/profile");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await httpClient.put("/user/edit", profileData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const response = await httpClient.post("/user/logout");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const forgotPassword = async (data) => {
  try {
    const response = await httpClient.post("/user/forgot-password", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const resetPassword = async (token, data) => {
  try {
    const response = await httpClient.post(
      `/user/reset-password?token=${token}`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};


