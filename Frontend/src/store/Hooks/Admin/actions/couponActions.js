import { setCoupons } from "../../../slices/Admin/CouponSlice.js";
import {
setCouponsLoading,
setCouponsError,
clearCouponsError,
} from "../../../slices/Admin/UiSlice.js";
import { getAllCoupons as apiGetAllCoupons } from "../../../../shared/api/Admin/coupon.apiService.js";
import { useCallback } from "react";


export const createCouponActions = (dispatch) => ({
setCouponsLoading: (loading) => dispatch(setCouponsLoading(loading)),
setCouponsError: (err) => dispatch(setCouponsError(err)),
clearCouponsError: () => dispatch(clearCouponsError()),


fetchCoupons: useCallback(async (page = 1, limit = 10) => {
dispatch(setCouponsLoading(true));
dispatch(clearCouponsError());
try {
const response = await apiGetAllCoupons(page, limit);
dispatch(setCoupons(response));
dispatch(setCouponsLoading(false));
return { type: "admin/fetchCoupons/fulfilled", payload: response };
} catch (error) {
const errorMessage =
error.response?.data?.message || error.message || "Failed to fetch coupons";
dispatch(setCouponsError(errorMessage));
dispatch(setCouponsLoading(false));
throw error;
}
},
 [dispatch]
    ),
});