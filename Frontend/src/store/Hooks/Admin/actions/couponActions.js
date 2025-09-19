import { useCallback } from "react";
import {
  createCoupon as apiCreateCoupon,
  deleteCoupon as apiDeleteCoupon,
  editCoupon as apiEditCoupon,
  getAllCoupons as apiGetAllCoupons,
} from "../../../../shared/api/Admin/coupon.apiService.js";
import { setCoupons } from "../../../slices/Admin/CouponSlice.js";
import {
  clearCouponsError,
  setCouponsError,
  setCouponsLoading,
} from "../../../slices/Admin/UiSlice.js";

export const createCouponActions = (dispatch) => ({
  setCouponsLoading: (loading) => dispatch(setCouponsLoading(loading)),
  setCouponsError: (err) => dispatch(setCouponsError(err)),
  clearCouponsError: () => dispatch(clearCouponsError()),

  fetchCoupons: useCallback(
    async (page = 1, limit = 10) => {
      dispatch(setCouponsLoading(true));
      dispatch(clearCouponsError());
      try {
        const response = await apiGetAllCoupons(page, limit);
        dispatch(setCoupons(response));
        dispatch(setCouponsLoading(false));
        return { type: "admin/fetchCoupons/fulfilled", payload: response };
      } catch (error) {
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

  createCoupon: useCallback(
    async (couponData) => {
      dispatch(setCouponsLoading(true));
      dispatch(clearCouponsError());
      try {
        const response = await apiCreateCoupon(couponData);
        // After creation, refresh first page to include the new coupon
        const list = await apiGetAllCoupons(1, 10);
        dispatch(setCoupons(list));
        dispatch(setCouponsLoading(false));
        return { type: "admin/createCoupon/fulfilled", payload: response };
      } catch (error) {
        const errs = error.response?.data?.errors;
        const msg =
          errs && Array.isArray(errs) && errs.length
            ? errs.map((e) => e.msg).join("; ")
            : error.response?.data?.message ||
              error.message ||
              "Failed to create coupon";
        dispatch(setCouponsError(msg));
        dispatch(setCouponsLoading(false));
        throw new Error(msg);
      }
    },
    [dispatch]
  ),

  editCoupon: useCallback(
    async (couponId, update) => {
      dispatch(setCouponsLoading(true));
      dispatch(clearCouponsError());
      try {
        const response = await apiEditCoupon(couponId, update);
        // Refresh current list
        const list = await apiGetAllCoupons(1, 10);
        dispatch(setCoupons(list));
        dispatch(setCouponsLoading(false));
        return { type: "admin/editCoupon/fulfilled", payload: response };
      } catch (error) {
        const errs = error.response?.data?.errors;
        const msg =
          errs && Array.isArray(errs) && errs.length
            ? errs.map((e) => e.msg).join("; ")
            : error.response?.data?.message ||
              error.message ||
              "Failed to edit coupon";
        dispatch(setCouponsError(msg));
        dispatch(setCouponsLoading(false));
        throw new Error(msg);
      }
    },
    [dispatch]
  ),

  deleteCoupon: useCallback(
    async (couponId) => {
      dispatch(setCouponsLoading(true));
      dispatch(clearCouponsError());
      try {
        const response = await apiDeleteCoupon(couponId);
        // Refresh current list
        const list = await apiGetAllCoupons(1, 10);
        dispatch(setCoupons(list));
        dispatch(setCouponsLoading(false));
        return { type: "admin/deleteCoupon/fulfilled", payload: response };
      } catch (error) {
        const errs = error.response?.data?.errors;
        const msg =
          errs && Array.isArray(errs) && errs.length
            ? errs.map((e) => e.msg).join("; ")
            : error.response?.data?.message ||
              error.message ||
              "Failed to delete coupon";
        dispatch(setCouponsError(msg));
        dispatch(setCouponsLoading(false));
        throw new Error(msg);
      }
    },
    [dispatch]
  ),
});
