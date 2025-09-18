import httpClient from "../http.js";

export const getAdminStats = async () => {
  try {
    // Since there might not be a dedicated stats endpoint,
    // we'll fetch basic counts from existing endpoints
    const [usersResponse, ordersResponse, productsResponse] = await Promise.all(
      [
        httpClient.get("/user/admin/all", { params: { page: 1, limit: 1 } }),
        httpClient.get("/order/admin/all", { params: { page: 1, limit: 1 } }),
        httpClient.get("/product", { params: { page: 1, limit: 1 } }),
      ]
    );

    // console.log("Admin Stats Responses:");
    // console.log(usersResponse.data);
    // console.log(ordersResponse.data);
    // console.log(productsResponse.data);

    return {
      totalUsers:
        usersResponse.data.totalCount || usersResponse.data.count || 0,
      totalOrders:
        ordersResponse.data.totalCount || ordersResponse.data.count || ordersResponse.data.total || 0,
      totalProducts:
        productsResponse.data.totalCount || productsResponse.data.count || productsResponse.data.total || 0,
    };
  } catch (error) {
    throw error;
  }
};