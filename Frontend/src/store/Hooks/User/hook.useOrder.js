import { useCallback } from "react";
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
        const response = await apiGetUserOrders(page, limit);
        dispatch(setOrders(response));
        return { type: "orders/fetchOrders/fulfilled", payload: response };
      } catch (error) {
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
        const response = await apiCreateOrder(orderData);
        dispatch(addOrder(response.order));
        dispatch(setCurrentOrder(response.order));
        return { type: "orders/createOrder/fulfilled", payload: response };
      } catch (error) {
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
