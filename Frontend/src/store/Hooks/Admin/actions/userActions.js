import {
setUsers,
} from "../../../slices/Admin/userSlice.js";
import {
setUsersLoading,
setUsersError,
clearUsersError,
} from "../../../slices/Admin/UiSlice.js";
import { getAllUsers as apiGetAllUsers } from "../../../../shared/api/Admin/allUser.apiService.js";
import { useCallback } from "react";


export const createUserActions = (dispatch) => ({
setUsersLoading: (loading) => dispatch(setUsersLoading(loading)),
setUsersError: (err) => dispatch(setUsersError(err)),
clearUsersError: () => dispatch(clearUsersError()),


fetchUsers: useCallback(async () => {
dispatch(setUsersLoading(true));
dispatch(clearUsersError());
try {
const response = await apiGetAllUsers();
dispatch(setUsers(response));
dispatch(setUsersLoading(false));
return { type: "admin/fetchUsers/fulfilled", payload: response };
} catch (error) {
const errorMessage =
error.response?.data?.message || error.message || "Failed to fetch users";
dispatch(setUsersError(errorMessage));
dispatch(setUsersLoading(false));
throw error;
}
},[dispatch])
});