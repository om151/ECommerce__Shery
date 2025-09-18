// uiSlice manages isLoading & errors centrally for admin
import { createSlice } from "@reduxjs/toolkit";
import { initialAdminState } from "./initialStateSlice";


const uiSlice = createSlice({
name: "adminUi",
initialState: { isLoading: initialAdminState.isLoading, errors: initialAdminState.errors },
reducers: {
// Loading
setStatsLoading: (state, action) => { state.isLoading.stats = action.payload; },
setUsersLoading: (state, action) => { state.isLoading.users = action.payload; },
setOrdersLoading: (state, action) => { state.isLoading.orders = action.payload; },
setProductsLoading: (state, action) => { state.isLoading.products = action.payload; },
setCouponsLoading: (state, action) => { state.isLoading.coupons = action.payload; },


// Errors
setStatsError: (state, action) => { state.errors.stats = action.payload; state.isLoading.stats = false; },
setUsersError: (state, action) => { state.errors.users = action.payload; state.isLoading.users = false; },
setOrdersError: (state, action) => { state.errors.orders = action.payload; state.isLoading.orders = false; },
setProductsError: (state, action) => { state.errors.products = action.payload; state.isLoading.products = false; },
setCouponsError: (state, action) => { state.errors.coupons = action.payload; state.isLoading.coupons = false; },


clearStatsError: (state) => { state.errors.stats = null; },
clearUsersError: (state) => { state.errors.users = null; },
clearOrdersError: (state) => { state.errors.orders = null; },
clearProductsError: (state) => { state.errors.products = null; },
clearCouponsError: (state) => { state.errors.coupons = null; },
},
});


export const {
setStatsLoading, setUsersLoading, setOrdersLoading, setProductsLoading, setCouponsLoading,
setStatsError, setUsersError, setOrdersError, setProductsError, setCouponsError,
clearStatsError, clearUsersError, clearOrdersError, clearProductsError, clearCouponsError,
} = uiSlice.actions;


export default uiSlice.reducer;