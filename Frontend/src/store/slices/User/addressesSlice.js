// Addresses Slice - Redux Toolkit slice for user addresses management
// Handles user addresses CRUD operations

import { createSlice } from "@reduxjs/toolkit";

// Initial state
const initialState = {
  addresses: [],
  selectedAddress: null,
  isLoading: false,
  error: null,
};

// Addresses slice
const addressesSlice = createSlice({
  name: "addresses",
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

    // Set addresses list
    setAddresses: (state, action) => {
      state.addresses = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    // Add new address
    addAddress: (state, action) => {
      state.addresses.push(action.payload);
      state.isLoading = false;
      state.error = null;
    },

    // Update existing address
    updateAddress: (state, action) => {
      const { id, ...addressData } = action.payload;
      const index = state.addresses.findIndex((addr) => addr._id === id);
      if (index !== -1) {
        state.addresses[index] = { ...state.addresses[index], ...addressData };
      }
      state.isLoading = false;
      state.error = null;
    },

    // Remove address
    removeAddress: (state, action) => {
      const addressId = action.payload;
      state.addresses = state.addresses.filter(
        (addr) => addr._id !== addressId
      );
      // Clear selected address if it was deleted
      if (state.selectedAddress?._id === addressId) {
        state.selectedAddress = null;
      }
      state.isLoading = false;
      state.error = null;
    },

    // Set selected address
    setSelectedAddress: (state, action) => {
      state.selectedAddress = action.payload;
    },

    // Clear selected address
    clearSelectedAddress: (state) => {
      state.selectedAddress = null;
    },
  },
});

// Export actions
export const {
  setLoading,
  setError,
  clearError,
  setAddresses,
  addAddress,
  updateAddress,
  removeAddress,
  setSelectedAddress,
  clearSelectedAddress,
} = addressesSlice.actions;

// Export reducer
export default addressesSlice.reducer;
