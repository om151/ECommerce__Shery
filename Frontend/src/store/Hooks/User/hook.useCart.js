import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  addCartItem,
  clearCart,
  clearError as clearCartError,
  removeCartItem,
  setError as setCartError,
  setCartItems,
  setLoading as setCartLoading,
  syncCart,
  updateCartItemQuantity,
} from "../../slices/User/cartSlice.js";

import {
  addToCart as apiAddToCart,
  getCart as apiGetCart,
  removeFromCart as apiRemoveFromCart,
  updateCartItem as apiUpdateCartItem,
} from "../../../shared/api/User/cart.apiService.js";

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;


export const useCart = () => {
  const dispatch = useAppDispatch();
  const cartState = useAppSelector((state) => state.user.cart);

  return {
    ...cartState,
    // Actions
    setLoading: (loading) => dispatch(setCartLoading(loading)),
    setCartError: (error) => dispatch(setCartError(error)),
    clearCartError: () => dispatch(clearCartError()),
    setCartItems: (items) => dispatch(setCartItems(items)),
    syncCart: (cartData) => dispatch(syncCart(cartData)),

    // API functions with proper error handling
    getCart: async () => {
      dispatch(setCartLoading(true));
      dispatch(clearCartError());
      try {
        const response = await apiGetCart();
        dispatch(setCartItems(response.cart?.items || []));
        return { type: "cart/getCart/fulfilled", payload: response };
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch cart";
        dispatch(setCartError(errorMessage));
        throw error;
      }
    },

    addToCart: async (itemData) => {
      dispatch(setCartLoading(true));
      dispatch(clearCartError());
      try {
        // API expects { productId, variantId?, quantity }
        const response = await apiAddToCart(itemData);

        // Add item to local state immediately for better UX
        dispatch(
          addCartItem({
            ...itemData,
            product: response.cartItem?.product || { _id: itemData.productId },
          })
        );

        return { type: "cart/addToCart/fulfilled", payload: response };
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to add to cart";
        dispatch(setCartError(errorMessage));
        throw error;
      }
    },

    updateQuantity: async (itemData) => {
      dispatch(clearCartError());
      try {
        // API expects { productId, variantId?, quantity }
        const response = await apiUpdateCartItem(itemData);

        // Update local state immediately
        dispatch(updateCartItemQuantity(itemData));

        return { type: "cart/updateQuantity/fulfilled", payload: response };
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to update cart item";
        dispatch(setCartError(errorMessage));

        // Revert local state on error by refetching cart
        try {
          const cartResponse = await apiGetCart();
          dispatch(setCartItems(cartResponse.cart?.items || []));
        } catch (fetchError) {
          console.error("Failed to revert cart state:", fetchError);
        }

        throw error;
      }
    },

    removeFromCart: async (itemData) => {
      dispatch(clearCartError());
      try {
        // API expects { productId, variantId? }
        const response = await apiRemoveFromCart(itemData);

        // Remove from local state immediately
        dispatch(removeCartItem(itemData));

        return { type: "cart/removeFromCart/fulfilled", payload: response };
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to remove from cart";
        dispatch(setCartError(errorMessage));

        // Revert local state on error by refetching cart
        try {
          const cartResponse = await apiGetCart();
          dispatch(setCartItems(cartResponse.cart?.items || []));
        } catch (fetchError) {
          console.error("Failed to revert cart state:", fetchError);
        }

        throw error;
      }
    },

    clearCart: async () => {
      dispatch(setCartLoading(true));
      dispatch(clearCartError());
      try {
        // Clear cart locally immediately
        dispatch(clearCart());

        // Note: You might want to add a clearCart API endpoint
        // For now, we could remove all items individually or handle this differently
        return { type: "cart/clearCart/fulfilled" };
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to clear cart";
        dispatch(setCartError(errorMessage));
        throw error;
      }
    },
  };
};