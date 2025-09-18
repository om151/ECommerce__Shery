import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {useAuth} from "../Common/hook.useAuth.js";
import {useCart} from "./hook.useCart.js";
import {useAddresses} from "./hook.useAddress.js";
import {useWishlist} from "./hook.useWishlist.js";


export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;


export const useAppInit = () => {
  const { initializeAuth } = useAuth();
  const { getCart } = useCart();
  const { fetchAddresses } = useAddresses();
  const { fetchWishlist } = useWishlist();

  const initializeApp = async () => {
    try {
      // Initialize auth first
      await initializeAuth();

      // If user is authenticated, fetch their data
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          // Fetch user's cart, addresses, and wishlist in parallel
          await Promise.allSettled([
            getCart(),
            fetchAddresses(),
            fetchWishlist(),
          ]);
        } catch (error) {
          console.warn("Failed to fetch user data:", error);
          // Don't throw error here, data fetch failure shouldn't break app initialization
        }
      }
    } catch (error) {
      console.warn("App initialization completed with warnings:", error);
    }
  };

  return { initializeApp };
};