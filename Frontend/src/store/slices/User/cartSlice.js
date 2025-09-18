// Cart Slice - Redux Toolkit slice for shopping cart management
// Handles cart items, quantities, totals, and cart operations

import { createSlice } from "@reduxjs/toolkit";

// Helper function to calculate cart totals
const calculateCartTotals = (items) => {
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = items.reduce((total, item) => {
    const price = item.product?.price || 0;
    return total + price * item.quantity;
  }, 0);

  return { itemCount, totalAmount };
};

// Initial state
const initialState = {
  items: [],
  itemCount: 0,
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
      state.items = action.payload;
      const totals = calculateCartTotals(state.items);
      state.itemCount = totals.itemCount;
      state.totalAmount = totals.totalAmount;
      state.isLoading = false;
      state.error = null;
    },
    
    // Add item to cart
    addCartItem: (state, action) => {
      const { productId, variantId, quantity = 1, product } = action.payload;
      
      // Check if item already exists in cart
      const existingItemIndex = state.items.findIndex(
        item => item.product._id === productId && 
        (variantId ? item.variantId === variantId : true)
      );
      
      if (existingItemIndex !== -1) {
        // Update quantity of existing item
        state.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item to cart
        state.items.push({
          product: product || { _id: productId },
          variantId,
          quantity,
          _id: Date.now().toString(), // Temporary ID
        });
      }
      
      // Recalculate totals
      const totals = calculateCartTotals(state.items);
      state.itemCount = totals.itemCount;
      state.totalAmount = totals.totalAmount;
      state.error = null;
    },
    
    // Update cart item quantity
    updateCartItemQuantity: (state, action) => {
      const { productId, variantId, quantity } = action.payload;
      
      const itemIndex = state.items.findIndex(
        item => item.product._id === productId && 
        (variantId ? item.variantId === variantId : true)
      );
      
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
        state.totalAmount = totals.totalAmount;
      }
      state.error = null;
    },
    
    // Remove item from cart
    removeCartItem: (state, action) => {
      const { productId, variantId } = action.payload;
      
      state.items = state.items.filter(
        item => !(item.product._id === productId && 
        (variantId ? item.variantId === variantId : true))
      );
      
      // Recalculate totals
      const totals = calculateCartTotals(state.items);
      state.itemCount = totals.itemCount;
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
      state.items = action.payload.items || [];
      const totals = calculateCartTotals(state.items);
      state.itemCount = totals.itemCount;
      state.totalAmount = totals.totalAmount;
      state.isLoading = false;
      state.error = null;
    }
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