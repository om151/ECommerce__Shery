// Orders Slice - Redux Toolkit slice for user orders management
// Handles user orders and order history

import { createSlice } from "@reduxjs/toolkit";

// Initial state
const initialState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
  // Pagination
  currentPage: 1,
  totalPages: 1,
  totalOrders: 0,
};

// Orders slice
const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    // Set error
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Set orders list
    setOrders: (state, action) => {
      const { orders, pagination } = action.payload;
      state.orders = orders || action.payload;
      if (pagination) {
        state.currentPage = pagination.currentPage;
        state.totalPages = pagination.totalPages;
        state.totalOrders = pagination.totalOrders;
      }
      state.isLoading = false;
      state.error = null;
    },

    // Add new order (after creation)
    addOrder: (state, action) => {
      state.orders.unshift(action.payload); // Add to beginning
      state.totalOrders += 1;
      state.isLoading = false;
      state.error = null;
    },

    // Set current order (for order details)
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    // Clear current order
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },

    // Update order status
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload;
      const orderIndex = state.orders.findIndex(
        (order) => order._id === orderId
      );
      if (orderIndex !== -1) {
        state.orders[orderIndex].status = status;
      }
      if (state.currentOrder?._id === orderId) {
        state.currentOrder.status = status;
      }
    },

    // Set pagination
    setPagination: (state, action) => {
      const { currentPage, totalPages, totalOrders } = action.payload;
      state.currentPage = currentPage;
      state.totalPages = totalPages;
      state.totalOrders = totalOrders;
    },
  },
});

// Export actions
export const {
  setLoading,
  setError,
  clearError,
  setOrders,
  addOrder,
  setCurrentOrder,
  clearCurrentOrder,
  updateOrderStatus,
  setPagination,
} = ordersSlice.actions;

// Export reducer
export default ordersSlice.reducer;
