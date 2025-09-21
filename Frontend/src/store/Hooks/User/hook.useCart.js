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
  clearCart as apiClearCart,
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

        // Instead of adding to local state, sync with the server response
        if (response.cart && response.cart.items) {
          dispatch(syncCart(response.cart));
        } else {
          // Fallback: add to local state
          const cartItemData = {
            ...itemData,
            product: { _id: itemData.productId },
          };
          dispatch(addCartItem(cartItemData));
        }

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

        // Sync with server response instead of updating local state
        if (response.cart && response.cart.items) {
          dispatch(syncCart(response.cart));
        } else {
          // Fallback: update local state
          dispatch(updateCartItemQuantity(itemData));
        }

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

        // Sync with server response instead of updating local state
        if (response.cart && response.cart.items) {
          dispatch(syncCart(response.cart));
        } else {
          // Fallback: remove from local state
          dispatch(removeCartItem(itemData));
        }

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
        const response = await apiClearCart();

        // Sync with server response
        if (response.cart) {
          dispatch(syncCart(response.cart));
        } else {
          // Fallback: clear local cart
          dispatch(clearCart());
        }

        return { type: "cart/clearCart/fulfilled", payload: response };
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
