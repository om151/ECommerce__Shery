import { useDispatch, useSelector } from "react-redux";

import {
  addWishlistItem,
  clearError as clearWishlistError,
  removeWishlistItem,
  setError as setWishlistError,
  setWishlistItems,
  setLoading as setWishlistLoading,
} from "../../slices/User/wishlistSlice.js";

import {
  addToWishlist as apiAddToWishlist,
  getWishlist as apiGetWishlist,
  removeFromWishlist as apiRemoveFromWishlist,
} from "../../../shared/api/User/wishlist.apiService.js";

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

export const useWishlist = () => {
  const dispatch = useAppDispatch();
  const wishlistState = useAppSelector((state) => state.user.wishlist);

  return {
    ...wishlistState,
    // Actions
    setLoading: (loading) => dispatch(setWishlistLoading(loading)),
    setWishlistError: (error) => dispatch(setWishlistError(error)),
    clearWishlistError: () => dispatch(clearWishlistError()),

    // API functions with proper error handling
    fetchWishlist: async () => {
      dispatch(setWishlistLoading(true));
      dispatch(clearWishlistError());
      try {
        const response = await apiGetWishlist();
        dispatch(setWishlistItems(response.wishlist?.products || []));
        return { type: "wishlist/fetchWishlist/fulfilled", payload: response };
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch wishlist";
        dispatch(setWishlistError(errorMessage));
        throw error;
      }
    },

    addToWishlist: async (productId) => {
      dispatch(clearWishlistError());
      try {
        const response = await apiAddToWishlist(productId);
        dispatch(addWishlistItem(response.wishlistItem));
        return { type: "wishlist/addToWishlist/fulfilled", payload: response };
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to add to wishlist";
        dispatch(setWishlistError(errorMessage));
        throw error;
      }
    },

    removeFromWishlist: async (productId) => {
      dispatch(clearWishlistError());
      try {
        await apiRemoveFromWishlist(productId);
        dispatch(removeWishlistItem(productId));
        return {
          type: "wishlist/removeFromWishlist/fulfilled",
          payload: productId,
        };
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to remove from wishlist";
        dispatch(setWishlistError(errorMessage));
        throw error;
      }
    },
  };
};
