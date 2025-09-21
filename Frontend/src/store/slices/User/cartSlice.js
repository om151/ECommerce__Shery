// Cart Slice - Redux Toolkit slice for shopping cart management
// Handles cart items, quantities, totals, and cart operations

import { createSlice } from "@reduxjs/toolkit";

// Helper function to calculate cart totals
const calculateCartTotals = (items) => {
  const itemCount = items.reduce((total, item) => total + item.quantity, 0); // Total quantity
  const uniqueItemCount = items.length; // Number of unique items
  const totalAmount = items.reduce((total, item) => {
    // Use totalPrice from server if available, otherwise calculate from product price
    if (item.totalPrice) {
      return total + item.totalPrice;
    }
    const price = item.product?.price || item.variant?.price || 0;
    return total + price * item.quantity;
  }, 0);

  return { itemCount, uniqueItemCount, totalAmount };
};

// Initial state
const initialState = {
  items: [],
  itemCount: 0, // Total quantity (sum of all item quantities)
  uniqueItemCount: 0, // Number of unique items in cart
  totalAmount: 0,
  isLoading: false,
  error: null,
};

// Cart slice
const cartSlice = createSlice({
  name: "cart",
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

    // Set cart items (for initial load)
    setCartItems: (state, action) => {
      const items = action.payload;

      // Map server cart items to frontend format if needed
      if (Array.isArray(items) && items.length > 0) {
        // Check if items are in server format (have productId instead of product)
        const firstItem = items[0];
        if (firstItem.productId && !firstItem.product) {
          state.items = items.map((item) => ({
            _id: item._id,
            product: item.productId,
            variantId: item.variantId?._id || item.variantId,
            variant: item.variantId,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
          }));
        } else {
          state.items = items;
        }
      } else {
        state.items = items || [];
      }

      const totals = calculateCartTotals(state.items);
      state.itemCount = totals.itemCount;
      state.uniqueItemCount = totals.uniqueItemCount;
      state.totalAmount = totals.totalAmount;
      state.isLoading = false;
      state.error = null;
    },

    // Add item to cart
    addCartItem: (state, action) => {
      const { productId, variantId, quantity = 1, product } = action.payload;

      // Check if item already exists in cart
      const existingItemIndex = state.items.findIndex(
        (item) =>
          item.product._id === productId &&
          (variantId ? item.variantId === variantId : true)
      );

      if (existingItemIndex !== -1) {
        // Update quantity of existing item
        state.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item to cart
        const newItem = {
          product: product || { _id: productId },
          variantId,
          quantity,
          _id: Date.now().toString(), // Temporary ID
        };
        state.items.push(newItem);
      }

      // Recalculate totals
      const totals = calculateCartTotals(state.items);
      state.itemCount = totals.itemCount;
      state.uniqueItemCount = totals.uniqueItemCount;
      state.totalAmount = totals.totalAmount;
      state.error = null;
    },

    // Update cart item quantity
    updateCartItemQuantity: (state, action) => {
      const { productId, variantId, quantity } = action.payload;

      const itemIndex = state.items.findIndex((item) => {
        const productMatch = item.product._id === productId;
        const variantMatch = variantId
          ? item.variantId === variantId || item.variant?._id === variantId
          : true;
        return productMatch && variantMatch;
      });

      if (itemIndex !== -1) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          state.items.splice(itemIndex, 1);
        } else {
          state.items[itemIndex].quantity = quantity;
        }

        // Recalculate totals
        const totals = calculateCartTotals(state.items);
        state.itemCount = totals.itemCount;
        state.uniqueItemCount = totals.uniqueItemCount;
        state.totalAmount = totals.totalAmount;
      }
      state.error = null;
    },

    // Remove item from cart
    removeCartItem: (state, action) => {
      const { productId, variantId } = action.payload;

      state.items = state.items.filter((item) => {
        const productMatch = item.product._id === productId;
        const variantMatch = variantId
          ? item.variantId === variantId || item.variant?._id === variantId
          : true;
        return !(productMatch && variantMatch);
      });

      // Recalculate totals
      const totals = calculateCartTotals(state.items);
      state.itemCount = totals.itemCount;
      state.uniqueItemCount = totals.uniqueItemCount;
      state.totalAmount = totals.totalAmount;
      state.error = null;
    },

    // Clear entire cart
    clearCart: (state) => {
      state.items = [];
      state.itemCount = 0;
      state.totalAmount = 0;
      state.error = null;
    },

    // Sync cart with server response
    syncCart: (state, action) => {
      const serverCart = action.payload;

      // Map server cart items to frontend format
      if (serverCart.items && Array.isArray(serverCart.items)) {
        state.items = serverCart.items.map((item) => ({
          _id: item._id,
          product: item.productId || item.product, // Backend uses 'productId', frontend expects 'product'
          variantId: item.variantId?._id || item.variantId, // Extract ID if populated
          variant: item.variantId, // Keep full variant data if needed
          quantity: item.quantity,
          totalPrice: item.totalPrice,
        }));
      } else {
        state.items = [];
      }

      // Use server total or recalculate
      if (serverCart.total !== undefined) {
        state.totalAmount = serverCart.total;
        state.itemCount = state.items.reduce(
          (total, item) => total + item.quantity,
          0
        );
        state.uniqueItemCount = state.items.length;
      } else {
        const totals = calculateCartTotals(state.items);
        state.itemCount = totals.itemCount;
        state.uniqueItemCount = totals.uniqueItemCount;
        state.totalAmount = totals.totalAmount;
      }

      state.isLoading = false;
      state.error = null;
    },
  },
});

// Export actions
export const {
  setLoading,
  setError,
  clearError,
  setCartItems,
  addCartItem,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  syncCart,
} = cartSlice.actions;

// Export reducer
export default cartSlice.reducer;
