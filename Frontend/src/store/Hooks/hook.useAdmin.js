import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

// import {
//   // clearOrdersError as clearAdminOrdersError,
//   // clearProductsError as clearAdminProductsError,
//   // clearCouponsError,
//   // clearStatsError,
//   // clearUsersError,
//   // setOrders as setAdminOrders,
//   // setOrdersError as setAdminOrdersError,
//   // setOrdersLoading as setAdminOrdersLoading,
//   // setProducts as setAdminProducts,
//   // setProductsError as setAdminProductsError,
//   // setProductsLoading as setAdminProductsLoading,
//   // setCoupons,
//   // setCouponsError,
//   // setCouponsLoading,
//   // setLowStockProducts,
//   // setRecentOrders,
//   // setStats,
//   // setStatsError,
//   // setStatsLoading,
//   // setUsers,
//   // setUsersError,
//   // setUsersLoading,
// } from "../slices/adminSlice.js";

import {
  clearStatsError,
  clearUsersError,
  setUsersLoading,
  setStatsLoading,
  setCouponsLoading,
  setProductsLoading as setAdminProductsLoading,
  setOrdersLoading as setAdminOrdersLoading,
  setCouponsError,
  clearCouponsError,
  setUsersError,
  setStatsError,
  setProductsError as setAdminProductsError,
  clearProductsError as clearAdminProductsError,
  clearOrdersError as clearAdminOrdersError,
  setOrdersError as setAdminOrdersError,
} from "../slices/Admin/UiSlice.js";

import{
  setUsers,
  
} from "../slices/Admin/userSlice.js"

import{
  setStats,
  
} from "../slices/Admin/statsSlice.js"

import{
  setCoupons,
  
} from "../slices/Admin/CouponSlice.js";

import{
  setProducts as setAdminProducts,
  setLowStockProducts,
} from "../slices/Admin/productSlice.js";

import {
   setOrders as setAdminOrders,
   setRecentOrders,
} from "../slices/Admin/orderSlice.js";



// import {
//   getAdminStats as apiGetAdminStats,
//   getAllCoupons as apiGetAllCoupons,
//   getAllOrders as apiGetAllOrders,
//   getAllProducts as apiGetAllProducts,
//   // Admin API functions
//   getAllUsers as apiGetAllUsers,
//   getLowStockProducts as apiGetLowStockProducts,
//   getRecentOrders as apiGetRecentOrders,
//   updateProduct as apiUpdateProduct,
// } from "../../shared/api/apiService.js";

import {getAdminStats as apiGetAdminStats,} from "../../shared/api/Admin/stats.apiService.js"
import { getAllCoupons as apiGetAllCoupons,} from "../../shared/api/Admin/coupon.apiService.js"
import { getAllOrders as apiGetAllOrders, getRecentOrders as apiGetRecentOrders,} from "../../shared/api/Admin/allOrders.apiService.js"
import { getAllProducts as apiGetAllProducts, getLowStockProducts as apiGetLowStockProducts, updateProduct as apiUpdateProduct,} from "../../shared/api/Admin/product.apiservice.js"
import { getAllUsers as apiGetAllUsers,} from "../../shared/api/Admin/allUser.apiService.js"




export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;



export const useAdmin = () => {
  const dispatch = useAppDispatch();
  const adminState = useAppSelector((state) => state.admin);

  return {
    ...adminState,
    // Loading actions
    setStatsLoading: (loading) => dispatch(setStatsLoading(loading)),
    setUsersLoading: (loading) => dispatch(setUsersLoading(loading)),
    setOrdersLoading: (loading) => dispatch(setAdminOrdersLoading(loading)),
    setProductsLoading: (loading) => dispatch(setAdminProductsLoading(loading)),
    setCouponsLoading: (loading) => dispatch(setCouponsLoading(loading)),

    // Error actions
    setStatsError: (error) => dispatch(setStatsError(error)),
    setUsersError: (error) => dispatch(setUsersError(error)),
    setOrdersError: (error) => dispatch(setAdminOrdersError(error)),
    setProductsError: (error) => dispatch(setAdminProductsError(error)),
    setCouponsError: (error) => dispatch(setCouponsError(error)),

    // Clear error actions
    clearStatsError: () => dispatch(clearStatsError()),
    clearUsersError: () => dispatch(clearUsersError()),
    clearOrdersError: () => dispatch(clearAdminOrdersError()),
    clearProductsError: () => dispatch(clearAdminProductsError()),
    clearCouponsError: () => dispatch(clearCouponsError()),

    // Memoized API functions with proper error handling
    fetchStats: useCallback(async () => {
      dispatch(setStatsLoading(true));
      dispatch(clearStatsError());
      try {
        const response = await apiGetAdminStats();
        dispatch(setStats(response));
        dispatch(setStatsLoading(false));
        return { type: "admin/fetchStats/fulfilled", payload: response };
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch stats";
        dispatch(setStatsError(errorMessage));
        dispatch(setStatsLoading(false));
        throw error;
      }
    }, [dispatch]),

    fetchUsers: useCallback(
      async (page = 1, limit = 10) => {
        // console.log("Fetching users, page:", page, "limit:", limit);
        dispatch(setUsersLoading(true));
        dispatch(clearUsersError());
        try {
          const response = await apiGetAllUsers(page, limit);
          // console.log("Users API response:", response);
          dispatch(setUsers(response));
          dispatch(setUsersLoading(false));
          return { type: "admin/fetchUsers/fulfilled", payload: response };
        } catch (error) {
          console.error("Failed to fetch users:", error);
          console.error("Error details:", error.response?.data);
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to fetch users";
          dispatch(setUsersError(errorMessage));
          dispatch(setUsersLoading(false));
          throw error;
        }
      },
      [dispatch]
    ),

    fetchOrders: useCallback(
      async (page = 1, limit = 10) => {
        // console.log("Fetching orders, page:", page, "limit:", limit);
        dispatch(setAdminOrdersLoading(true));
        dispatch(clearAdminOrdersError());
        try {
          const response = await apiGetAllOrders(page, limit);
          // console.log("Orders API response:", response);
          dispatch(setAdminOrders(response));
           dispatch(setAdminOrdersLoading(false));
          return { type: "admin/fetchOrders/fulfilled", payload: response };
        } catch (error) {
          console.error("Failed to fetch orders:", error);
          console.error("Error details:", error.response?.data);
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to fetch orders";
          dispatch(setAdminOrdersError(errorMessage));
           dispatch(setAdminOrdersLoading(true));
          throw error;
        }
      },
      [dispatch]
    ),

    fetchRecentOrders: useCallback(
      async (limit = 10) => {
        try {
          const response = await apiGetRecentOrders(limit);
          dispatch(setRecentOrders(response));
          return {
            type: "admin/fetchRecentOrders/fulfilled",
            payload: response,
          };
        } catch (error) {
          console.error("Failed to fetch recent orders:", error);
          throw error;
        }
      },
      [dispatch]
    ),

    fetchProducts: useCallback(
      async (page = 1, limit = 10) => {
        // console.log("Fetching products, page:", page, "limit:", limit);
        dispatch(setAdminProductsLoading(true));
        dispatch(clearAdminProductsError());
        try {
          const response = await apiGetAllProducts(page, limit);
          // console.log("Products API response:", response);
          dispatch(setAdminProducts(response));
          dispatch(setAdminProductsLoading(false));
          return { type: "admin/fetchProducts/fulfilled", payload: response };
        } catch (error) {
          console.error("Failed to fetch products:", error);
          console.error("Error details:", error.response?.data);
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to fetch products";
          dispatch(setAdminProductsError(errorMessage));
          dispatch(setAdminProductsLoading(false));
          throw error;
        }
      },
      [dispatch]
    ),

    fetchLowStockProducts: useCallback(
      async (threshold = 5) => {
        try {
          const response = await apiGetLowStockProducts(threshold);
          dispatch(setLowStockProducts(response));
          return {
            type: "admin/fetchLowStockProducts/fulfilled",
            payload: response,
          };
        } catch (error) {
          console.error("Failed to fetch low stock products:", error);
          throw error;
        }
      },
      [dispatch]
    ),

    fetchCoupons: useCallback(
      async (page = 1, limit = 10) => {
        // console.log("Fetching coupons, page:", page, "limit:", limit);
        dispatch(setCouponsLoading(true));
        dispatch(clearCouponsError());
        try {
          const response = await apiGetAllCoupons(page, limit);
          // console.log("Coupons API response:", response);
          dispatch(setCoupons(response));
          dispatch(setCouponsLoading(false));
          return { type: "admin/fetchCoupons/fulfilled", payload: response };
        } catch (error) {
          console.error("Failed to fetch coupons:", error);
          console.error("Error details:", error.response?.data);
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to fetch coupons";
          dispatch(setCouponsError(errorMessage));
          dispatch(setCouponsLoading(false));
          throw error;
        }
      },
      [dispatch]
    ),

    // Initialize admin dashboard data
    initializeAdminDashboard: useCallback(async () => {
      // console.log("Initializing admin dashboard...");
      try {
        // Set loading state first
        dispatch(setStatsLoading(true));

        // console.log("Fetching admin stats...");
        const statsPromise = apiGetAdminStats()
          .then((response) => {
            // console.log("Stats response:", response);
            dispatch(setStats(response));
            return response;
          })
          .catch((error) => {
            console.error("Stats error:", error);
            dispatch(setStatsError("Failed to load stats"));
            return null;
          });

        // console.log("Fetching recent orders...");
        const ordersPromise = apiGetRecentOrders(5)
          .then((response) => {
            console.log("Recent orders response:", response);
            dispatch(setRecentOrders(response));
            return response;
          })
          .catch((error) => {
            console.error("Recent orders error:", error);
            return null;
          });

        // console.log("Fetching low stock products...");
        const lowStockPromise = apiGetLowStockProducts(5)
          .then((response) => {
            // console.log("Low stock products response:", response);
            dispatch(setLowStockProducts(response));
            return response;
          })
          .catch((error) => {
            console.error("Low stock products error:", error);
            return null;
          });

        // Wait for all promises to complete
        await Promise.allSettled([
          statsPromise,
          ordersPromise,
          lowStockPromise,
        ]);

        dispatch(setStatsLoading(false));
        // console.log("Admin dashboard initialization complete");
      } catch (error) {
        console.error("Failed to initialize admin dashboard:", error);
        dispatch(setStatsLoading(false));
        dispatch(setStatsError("Failed to load dashboard data"));
      }
    }, [dispatch]),

    // Update a product
    updateProduct: useCallback(
      async (productId, productData) => {
        // console.log("Updating product:", productId, productData);
        try {
          const response = await apiUpdateProduct(productId, productData);
          // console.log("Product update response:", response);
          return { type: "admin/updateProduct/fulfilled", payload: response };
        } catch (error) {
          console.error("Failed to update product:", error);
          console.error("Error details:", error.response?.data);
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to update product";
          throw new Error(errorMessage);
        }
      },
      [dispatch]
    ),
  };
};
