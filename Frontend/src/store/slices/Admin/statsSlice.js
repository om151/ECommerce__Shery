import { createSlice } from "@reduxjs/toolkit";
import { initialAdminState } from "./initialStateSlice.js";


const statsSlice = createSlice({
name: "adminStats",
initialState: initialAdminState.stats,
reducers: {
// setStatsLoading: (state, action) => {
// // handled at root isLoading slice, but keep if desired
// },
// setStatsError: (state, action) => {
// // handled at root errors slice, keep if desired
// },
setStats: (state, action) => {
return { ...state, ...action.payload };
},
},
});


export const { setStats } = statsSlice.actions;
export const statsReducer = statsSlice.reducer;