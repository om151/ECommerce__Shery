import { createSlice } from "@reduxjs/toolkit";
import { initialAdminState } from ".//initialStateSlice";


const couponsSlice = createSlice({
name: "adminCoupons",
initialState: initialAdminState.coupons,
reducers: {
setCoupons: (state, action) => {
state.list = action.payload.coupons || action.payload.data || [];
state.total = action.payload.totalCount || action.payload.total || 0;
state.currentPage = action.payload.currentPage || action.payload.page || 1;
state.totalPages = action.payload.totalPages || Math.ceil(state.total / 10);
},
// setCouponsError: (state, action) => {},
},
});


export const { setCoupons } = couponsSlice.actions;
export default couponsSlice.reducer;