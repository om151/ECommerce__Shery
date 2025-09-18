import { createSlice } from "@reduxjs/toolkit";
import { initialAdminState } from "./initialStateSlice";


const productsSlice = createSlice({
name: "adminProducts",
initialState: initialAdminState.products,
reducers: {
setProducts: (state, action) => {
state.list = action.payload.products || action.payload.data || [];
state.total = action.payload.total || action.payload.totalCount || action.payload.count || 0;
state.currentPage = action.payload.currentPage || action.payload.page || 1;
state.totalPages = action.payload.totalPages || Math.ceil(state.total / 10);
},
setLowStockProducts: (state, action) => {
state.lowStockProducts = action.payload.products || action.payload.data || [];
},
// setProductsError: (state, action) => {},
},
});


export const { setProducts, setLowStockProducts } = productsSlice.actions;
export default productsSlice.reducer;