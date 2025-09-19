import {
setOrders as setAdminOrders,
setAllOrders as setAdminAllOrders,
setRecentOrders,
} from "../../../slices/Admin/orderSlice.js";
import {
setOrdersLoading as setAdminOrdersLoading,
setOrdersError as setAdminOrdersError,
clearOrdersError as clearAdminOrdersError,
} from "../../../slices/Admin/UiSlice.js";
import {
getAllOrders as apiGetAllOrders,
getAllOrdersTotalOrders as apiGetAllOrdersTotalOrders,
getRecentOrders as apiGetRecentOrders,
} from "../../../../shared/api/Admin/allOrders.apiService.js";
import { useCallback } from "react";


export const createOrderActions = (dispatch) => ({
setOrdersLoading: (loading) => dispatch(setAdminOrdersLoading(loading)),
setOrdersError: (err) => dispatch(setAdminOrdersError(err)),
clearOrdersError: () => dispatch(clearAdminOrdersError()),


fetchOrders:  useCallback(async (page = 1, limit = 10) => {
dispatch(setAdminOrdersLoading(true));
dispatch(clearAdminOrdersError());
try {
const response = await apiGetAllOrders(page, limit);
dispatch(setAdminOrders(response));
dispatch(setAdminOrdersLoading(false));
return { type: "admin/fetchOrders/fulfilled", payload: response };
} catch (error) {
const errorMessage =
error.response?.data?.message || error.message || "Failed to fetch orders";
dispatch(setAdminOrdersError(errorMessage));
dispatch(setAdminOrdersLoading(false));
throw error;
}
},
 [dispatch]
    ),

    fetchAllOrders: useCallback(async () => {
      dispatch(setAdminOrdersLoading(true));
      dispatch(clearAdminOrdersError());
      try {
        const response = await apiGetAllOrdersTotalOrders();
        dispatch(setAdminAllOrders(response));
        dispatch(setAdminOrdersLoading(false));
        return { type: "admin/fetchAllOrders/fulfilled", payload: response };
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || error.message || "Failed to fetch orders";
        dispatch(setAdminOrdersError(errorMessage));
        dispatch(setAdminOrdersLoading(false));
        throw error;
      }
    }, [dispatch]),

fetchRecentOrders: useCallback( async (limit = 10) => {
try {
const response = await apiGetRecentOrders(limit);
dispatch(setRecentOrders(response));
return { type: "admin/fetchRecentOrders/fulfilled", payload: response };
} catch (error) {
throw error;
}
},[dispatch])
});