import {
setStatsError,
setStatsLoading,
clearStatsError,
} from "../../../slices/Admin/UiSlice.js"; // ui actions
import { setStats } from "../../../slices/Admin/statsSlice.js"; // slice actions
import { getAdminStats as apiGetAdminStats } from "../../../../shared/api/Admin/stats.apiService.js"; // api
import { useCallback } from "react";
import{getLowStockProducts} from "../../../../shared/api/Admin/product.apiservice.js";
import {getRecentOrders} from "../../../../shared/api/Admin/allOrders.apiService.js"

import {setRecentOrders} from "../../../slices/Admin/orderSlice.js"
import {setLowStockProducts} from "../../../slices/Admin/productSlice.js"

export const createStatsActions = (dispatch) => ({
setStatsLoading: (loading) => dispatch(setStatsLoading(loading)),
setStatsError: (err) => dispatch(setStatsError(err)),
clearStatsError: () => dispatch(clearStatsError()),


fetchStats: useCallback( async () => {
dispatch(setStatsLoading(true));
dispatch(clearStatsError());
try {
const response = await apiGetAdminStats();
dispatch(setStats(response));
dispatch(setStatsLoading(false));
return { type: "admin/fetchStats/fulfilled", payload: response };
} catch (error) {
const errorMessage =
error.response?.data?.message || error.message || "Failed to fetch stats";
dispatch(setStatsError(errorMessage));
dispatch(setStatsLoading(false));
throw error;
}
},[dispatch]),


// initialization used by dashboard (keeps only stats-related pieces here)
initializeAdminDashboard: useCallback(async () => {
dispatch(setStatsLoading(true));
try {
//  dispatch(setStatsLoading(true));

        console.log("Fetching admin stats...");
        const statsPromise = apiGetAdminStats()
          .then((response) => {
            console.log("Stats response:", response);
            dispatch(setStats(response));
            return response;
          })
          .catch((error) => {
            console.error("Stats error:", error);
            dispatch(setStatsError("Failed to load stats"));
            return null;
          });

        console.log("Fetching recent orders...");
        const ordersPromise = getRecentOrders(5)
          .then((response) => {
            console.log("Recent orders response:", response);
            dispatch(setRecentOrders(response));
            return response;
          })
          .catch((error) => {
            console.error("Recent orders error:", error);
            return null;
          });

        console.log("Fetching low stock products...");
        const lowStockPromise = getLowStockProducts(5)
          .then((response) => {
            console.log("Low stock products response:", response);
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
        console.log("Admin dashboard initialization complete");
      } catch (error) {
        console.error("Failed to initialize admin dashboard:", error);
        dispatch(setStatsLoading(false));
        dispatch(setStatsError("Failed to load dashboard data"));
      }
},[dispatch])
});