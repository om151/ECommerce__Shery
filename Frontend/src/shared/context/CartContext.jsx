// Cart Context - Global state management for shopping cart
// This file creates React Context for managing cart state throughout the app

import { createContext, useContext, useEffect, useReducer } from "react";
import {
  addToCart as apiAddToCart,
  removeFromCart as apiRemoveFromCart,
  getCart,
  updateCartItem,
} from "../api/apiService.js";

// Create Cart Context
const CartContext = createContext();

// Cart action types - defines all possible cart operations
const CART_ACTIONS = {
  SET_LOADING: "SET_LOADING", // Set loading state
  SET_ERROR: "SET_ERROR", // Set error state
  SET_CART: "SET_CART", // Set entire cart data
  ADD_ITEM: "ADD_ITEM", // Add item to cart
  UPDATE_ITEM: "UPDATE_ITEM", // Update item quantity
  REMOVE_ITEM: "REMOVE_ITEM", // Remove item from cart
  CLEAR_CART: "CLEAR_CART", // Clear all cart items
  SET_ITEM_COUNT: "SET_ITEM_COUNT", // Set total item count
  SET_TOTAL_AMOUNT: "SET_TOTAL_AMOUNT", // Set total cart amount
};

// Initial cart state
const initialCartState = {
  items: [], // Array of cart items
  totalAmount: 0, // Total cart amount
  itemCount: 0, // Total number of items
  isLoading: false, // Loading state for API calls
  error: null, // Error message if any
  lastUpdated: null, // Timestamp of last cart update
};

// Cart reducer function - handles all cart state updates
const cartReducer = (state, action) => {
  switch (action.type) {
    // Set loading state
    case CART_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
        error: null, // Clear error when starting new operation
      };

    // Set error state
    case CART_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    // Set entire cart data (from API)
    case CART_ACTIONS.SET_CART:
      const { items, totalAmount, itemCount } = action.payload;
      return {
        ...state,
        items: items || [],
        totalAmount: totalAmount || 0,
        itemCount: itemCount || 0,
        isLoading: false,
        error: null,
        lastUpdated: new Date().toISOString(),
      };

    // Add item to cart (optimistic update)
    case CART_ACTIONS.ADD_ITEM:
      const newItem = action.payload;
      const existingItemIndex = state.items.findIndex(
        (item) =>
          item.productId === newItem.productId &&
          item.variantId === newItem.variantId
      );

      let updatedItems;
      if (existingItemIndex >= 0) {
        // Item exists - update quantity
        updatedItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      } else {
        // New item - add to cart
        updatedItems = [...state.items, newItem];
      }

      return {
        ...state,
        items: updatedItems,
        lastUpdated: new Date().toISOString(),
      };

    // Update item quantity
    case CART_ACTIONS.UPDATE_ITEM:
      const { productId, variantId, quantity } = action.payload;
      return {
        ...state,
        items: state.items.map((item) =>
          item.productId === productId && item.variantId === variantId
            ? { ...item, quantity: quantity }
            : item
        ),
        lastUpdated: new Date().toISOString(),
      };

    // Remove item from cart
    case CART_ACTIONS.REMOVE_ITEM:
      const { productId: removeProductId, variantId: removeVariantId } =
        action.payload;
      return {
        ...state,
        items: state.items.filter(
          (item) =>
            !(
              item.productId === removeProductId &&
              item.variantId === removeVariantId
            )
        ),
        lastUpdated: new Date().toISOString(),
      };

    // Clear all cart items
    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: [],
        totalAmount: 0,
        itemCount: 0,
        lastUpdated: new Date().toISOString(),
      };

    // Set total item count
    case CART_ACTIONS.SET_ITEM_COUNT:
      return {
        ...state,
        itemCount: action.payload,
      };

    // Set total amount
    case CART_ACTIONS.SET_TOTAL_AMOUNT:
      return {
        ...state,
        totalAmount: action.payload,
      };

    default:
      return state;
  }
};

// Cart Provider Component - wraps app and provides cart state/actions
export const CartProvider = ({ children }) => {
  // Initialize cart reducer
  const [cartState, dispatch] = useReducer(cartReducer, initialCartState);

  // Load cart data on component mount
  useEffect(() => {
    loadCart();
  }, []);

  // Recalculate totals when items change
  useEffect(() => {
    calculateTotals();
  }, [cartState.items]);

  // ==========================================================================
  // CART ACTIONS - Functions that components can call
  // ==========================================================================

  /**
   * Load cart data from API
   */
  const loadCart = async () => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

      // Get cart data from API
      const cartData = await getCart();

      // Update state with cart data
      dispatch({
        type: CART_ACTIONS.SET_CART,
        payload: {
          items: cartData.cart?.items || [],
          totalAmount: cartData.cart?.totalAmount || 0,
          itemCount: cartData.cart?.itemCount || 0,
        },
      });
    } catch (error) {
      console.error("Error loading cart:", error);

      // For demo purposes, initialize with empty cart if API fails
      dispatch({
        type: CART_ACTIONS.SET_CART,
        payload: {
          items: [],
          totalAmount: 0,
          itemCount: 0,
        },
      });
    } finally {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: false });
    }
  };

  /**
   * Add item to cart
   * @param {string} productId - Product ID
   * @param {string} variantId - Variant ID (can be null)
   * @param {number} quantity - Quantity to add
   */
  const addItem = async (productId, variantId, quantity) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

      // For demo purposes, add item locally
      // In a real app, this would call the API first
      dispatch({
        type: CART_ACTIONS.ADD_ITEM,
        payload: {
          productId,
          variantId,
          quantity,
          // Add some mock product data for demo
          product: {
            _id: productId,
            name: "Demo Product",
            price: 29.99,
            image: "/api/placeholder/150/150",
          },
        },
      });

      // Try to call API but don't fail if it doesn't work
      try {
        await apiAddToCart({ productId, variantId, quantity });
        // If API works, reload cart
        await loadCart();
      } catch (apiError) {
        console.log("API not available, working in demo mode");
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
    } finally {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: false });
    }
  };

  /**
   * Update item quantity in cart
   * @param {string} productId - Product ID
   * @param {string} variantId - Variant ID
   * @param {number} quantity - New quantity
   */
  const updateItem = async (productId, variantId, quantity) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

      // Update item locally
      dispatch({
        type: CART_ACTIONS.UPDATE_ITEM,
        payload: { productId, variantId, quantity },
      });

      // Try to call API but don't fail if it doesn't work
      try {
        await updateCartItem({ productId, variantId, quantity });
        await loadCart();
      } catch (apiError) {
        console.log("API not available, working in demo mode");
      }
    } catch (error) {
      console.error("Error updating cart item:", error);
    } finally {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: false });
    }
  };

  /**
   * Remove item from cart
   * @param {string} productId - Product ID
   * @param {string} variantId - Variant ID
   */
  const removeItem = async (productId, variantId) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

      // Remove item locally
      dispatch({
        type: CART_ACTIONS.REMOVE_ITEM,
        payload: { productId, variantId },
      });

      // Try to call API but don't fail if it doesn't work
      try {
        await apiRemoveFromCart({ productId, variantId });
        await loadCart();
      } catch (apiError) {
        console.log("API not available, working in demo mode");
      }
    } catch (error) {
      console.error("Error removing cart item:", error);
    } finally {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: false });
    }
  };

  /**
   * Clear all items from cart
   */
  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  /**
   * Calculate cart totals based on current items
   */
  const calculateTotals = () => {
    const items = cartState.items;

    // Calculate total item count
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);

    // Calculate total amount
    const totalAmount = items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    // Update state with calculated values
    dispatch({ type: CART_ACTIONS.SET_ITEM_COUNT, payload: itemCount });
    dispatch({ type: CART_ACTIONS.SET_TOTAL_AMOUNT, payload: totalAmount });
  };

  // Context value object - all data and functions available to consuming components
  const contextValue = {
    // Cart state
    ...cartState,

    // Cart actions
    loadCart,
    addItem,
    updateItem,
    removeItem,
    clearCart,

    // Utility functions
    calculateTotals,
  };

  // Provide context value to all child components
  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

// Custom hook to use cart context
// This hook can be imported and used in any component that needs cart functionality
export const useCart = () => {
  const context = useContext(CartContext);

  // Ensure hook is used within CartProvider
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
};

// Export context for advanced use cases
export { CartContext };
