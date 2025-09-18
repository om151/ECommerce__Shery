// Wishlist Slice - Redux Toolkit slice for user wishlist management
// Handles wishlist items and operations

import { createSlice } from "@reduxjs/toolkit";

// Initial state
const initialState = {
  items: [],
  itemCount: 0,
  isLoading: false,
  error: null,
};

// Wishlist slice
const wishlistSlice = createSlice({
  name: "wishlist",
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

    // Set wishlist items
    setWishlistItems: (state, action) => {
      state.items = action.payload;
      state.itemCount = action.payload.length;
      state.isLoading = false;
      state.error = null;
    },

    // Add item to wishlist
    addWishlistItem: (state, action) => {
      const existingItem = state.items.find(
        (item) => item.product._id === action.payload.product._id
      );

      if (!existingItem) {
        state.items.push(action.payload);
        state.itemCount += 1;
      }
      state.isLoading = false;
      state.error = null;
    },

    // Remove item from wishlist
    removeWishlistItem: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(
        (item) => item.product._id !== productId
      );
      state.itemCount = state.items.length;
      state.isLoading = false;
      state.error = null;
    },

    // Clear entire wishlist
    clearWishlist: (state) => {
      state.items = [];
      state.itemCount = 0;
      state.error = null;
    },

    // Check if product is in wishlist (helper)
    toggleWishlistItem: (state, action) => {
      const productId = action.payload.productId;
      const existingIndex = state.items.findIndex(
        (item) => item.product._id === productId
      );

      if (existingIndex !== -1) {
        // Remove from wishlist
        state.items.splice(existingIndex, 1);
        state.itemCount -= 1;
      } else {
        // Add to wishlist
        state.items.push(action.payload.wishlistItem);
        state.itemCount += 1;
      }
      state.error = null;
    },
  },
});

// Export actions
export const {
  setLoading,
  setError,
  clearError,
  setWishlistItems,
  addWishlistItem,
  removeWishlistItem,
  clearWishlist,
  toggleWishlistItem,
} = wishlistSlice.actions;

// Export reducer
export default wishlistSlice.reducer;
