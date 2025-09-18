import { createSlice } from "@reduxjs/toolkit";
import { initialAdminState } from "./initialStateSlice";


const usersSlice = createSlice({
name: "adminUsers",
initialState: initialAdminState.users,
reducers: {
setUsersLoading: (state, action) => {},
setUsersError: (state, action) => {},
clearUsersError: (state) => { state.error = null; },
setUsers: (state, action) => {
state.list = action.payload.users || action.payload.data || [];
state.total = action.payload.totalCount || action.payload.count || 0;
state.currentPage = action.payload.currentPage || action.payload.page || 1;
state.totalPages = action.payload.totalPages || Math.ceil(state.total / 10);
},
},
});


export const { setUsers, clearUsersError } = usersSlice.actions;
export const usersReducer = usersSlice.reducer;