import { createSlice } from "@reduxjs/toolkit";
import { initialAdminState } from "./initialStateSlice";


const ordersSlice = createSlice({
name: "adminOrders",
initialState: initialAdminState.orders,
reducers: {
setOrders: (state, action) => {
state.list = action.payload.orders || action.payload.data || [];
state.total = action.payload.totalCount || action.payload.total || 0;
state.currentPage = action.payload.currentPage || action.payload.page || 1;
state.totalPages = action.payload.totalPages || Math.ceil(state.total / 10);
},
setAllOrders: (state, action) => {
state.allOrders = action.payload.totalOrders.orders || action.payload.data || [];
},
setRecentOrders: (state, action) => {
state.recentOrders = action.payload.orders || action.payload.data || [];
},
// setOrdersError: (state, action) => {},

},
});


export const { setOrders, setRecentOrders,setAllOrders } = ordersSlice.actions;
export default ordersSlice.reducer;