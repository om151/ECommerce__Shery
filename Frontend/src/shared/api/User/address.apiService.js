import httpClient from "../http.js";


export const getUserAddresses = async () => {
  try {
    const response = await httpClient.get("/address");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createAddress = async (addressData) => {
  try {
    const response = await httpClient.post("/address", addressData);
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const updateAddress = async (addressId, addressData) => {
  try {
    const response = await httpClient.put(`/address/${addressId}`, addressData);
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const deleteAddress = async (addressId) => {
  try {
    const response = await httpClient.delete(`/address/${addressId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const getAddress = async (addressId) => {
  try {
    const response = await httpClient.get(`/address/${addressId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// export const getShippingPrice = async (shippingData) => {
//   try {
//     const response = await httpClient.get("/address/shipping-price", {
//       params: shippingData,
//     });
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };