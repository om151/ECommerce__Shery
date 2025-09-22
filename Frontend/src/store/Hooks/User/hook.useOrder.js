import { useDispatch, useSelector } from "react-redux";

import {
  addOrder,
  clearCurrentOrder,
  clearError as clearOrdersError,
  setCurrentOrder,
  setOrders,
  setError as setOrdersError,
  setLoading as setOrdersLoading,
} from "../../slices/User/ordersSlice.js";

import {
  createOrder as apiCreateOrder,
  getOrderById as apiGetOrderById,
  getUserOrders as apiGetUserOrders,
} from "../../../shared/api/User/order.apiService.js";

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

export const useOrders = () => {
  const dispatch = useAppDispatch();
  const ordersState = useAppSelector((state) => state.user.orders);
  // console.log("orders hai ",ordersState)

  return {
    ...ordersState,
    // Actions
    setLoading: (loading) => dispatch(setOrdersLoading(loading)),
    setOrdersError: (error) => dispatch(setOrdersError(error)),
    clearOrdersError: () => dispatch(clearOrdersError()),
    clearCurrentOrder: () => dispatch(clearCurrentOrder()),

    // API functions with proper error handling
    fetchOrders: async (page = 1, limit = 10) => {
      dispatch(setOrdersLoading(true));
      dispatch(clearOrdersError());
      try {
        console.log("🔄 ORDERS - Fetching orders with params:", {
          page,
          limit,
        });
        const response = await apiGetUserOrders({ page, limit });
        console.log("✅ ORDERS - API response:", response);
        dispatch(setOrders(response.orders || response.data || []));
        return { type: "orders/fetchOrders/fulfilled", payload: response };
      } catch (error) {
        console.error("❌ ORDERS - Error fetching orders:", error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch orders";
        dispatch(setOrdersError(errorMessage));
        throw error;
      }
    },

    getOrder: async (orderId) => {
      dispatch(setOrdersLoading(true));
      dispatch(clearOrdersError());
      try {
        const response = await apiGetOrderById(orderId);
        dispatch(setCurrentOrder(response.order));
        return { type: "orders/getOrder/fulfilled", payload: response };
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch order";
        dispatch(setOrdersError(errorMessage));
        throw error;
      }
    },

    createOrder: async (orderData) => {
      dispatch(setOrdersLoading(true));
      dispatch(clearOrdersError());
      try {
        console.log("🚀 ORDERS - Creating order with data:", orderData);
        const response = await apiCreateOrder(orderData);
        console.log("✅ ORDERS - Order created, response:", response);

        // Handle different response formats
        const order = response.order || response.data;
        if (order) {
          dispatch(addOrder(order));
          dispatch(setCurrentOrder(order));
          console.log("✅ ORDERS - Order added to store:", order);
        }

        return { type: "orders/createOrder/fulfilled", payload: response };
      } catch (error) {
        console.error("❌ ORDERS - Error creating order:", error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to create order";
        dispatch(setOrdersError(errorMessage));
        throw error;
      }
    },
  };
};
