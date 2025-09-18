import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  clearError as clearAuthError,
  loginSuccess,
  logout,
  registerSuccess,
  selectIsAdmin,
  selectUserRole,
  setError as setAuthError,
  setLoading as setAuthLoading,
  setUser,
  updateProfile,
} from "../../slices/Common/authSlice.js";

import {
  getUserProfile as apiGetProfile,
  loginUser as apiLogin,
  logoutUser as apiLogout,
  registerUser as apiRegister,
  updateUserProfile as apiUpdateProfile,
} from "../../../shared/api/Common/auth.apiServices.js";

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;


export const useAuth = () => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);
  const isAdmin = useAppSelector(selectIsAdmin);
  const userRole = useAppSelector(selectUserRole);

  return {
    ...authState,
    // Role-based properties
    isAdmin,
    userRole,

    // Actions
    setLoading: (loading) => dispatch(setAuthLoading(loading)),
    setAuthError: (error) => dispatch(setAuthError(error)),
    clearAuthError: () => dispatch(clearAuthError()),
    loginSuccess: (data) => dispatch(loginSuccess(data)),
    registerSuccess: (data) => dispatch(registerSuccess(data)),
    logout: () => dispatch(logout()),
    updateProfile: (data) => dispatch(updateProfile(data)),
    setUser: (user) => dispatch(setUser(user)),

    // API functions with proper error handling
    login: async (credentials) => {
      dispatch(setAuthLoading(true));
      dispatch(clearAuthError());
      try {
        const response = await apiLogin(credentials);
        dispatch(loginSuccess(response));
        return { type: "auth/login/fulfilled", payload: response };
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || error.message || "Login failed";
        dispatch(setAuthError(errorMessage));
        throw error;
      }
    },

    register: async (userData) => {
      dispatch(setAuthLoading(true));
      dispatch(clearAuthError());
      try {
        const response = await apiRegister(userData);
        dispatch(registerSuccess(response));
        return { type: "auth/register/fulfilled", payload: response };
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Registration failed";
        dispatch(setAuthError(errorMessage));
        throw error;
      }
    },

    getProfile: async () => {
      dispatch(setAuthLoading(true));
      dispatch(clearAuthError());
      try {
        const response = await apiGetProfile();
        dispatch(setUser(response.user));
        return { type: "auth/getProfile/fulfilled", payload: response };
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch profile";
        dispatch(setAuthError(errorMessage));
        // If profile fetch fails with auth error, logout user
        if (error.response?.status === 401 || error.response?.status === 403) {
          dispatch(logout());
        }
        throw error;
      }
    },

    updateUserProfile: async (profileData) => {
      dispatch(setAuthLoading(true));
      dispatch(clearAuthError());
      try {
        const response = await apiUpdateProfile(profileData);
        dispatch(updateProfile(response.user));
        return { type: "auth/updateProfile/fulfilled", payload: response };
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to update profile";
        dispatch(setAuthError(errorMessage));
        throw error;
      } finally {
        dispatch(setAuthLoading(false));
      }
    },

    logoutUser: async () => {
      dispatch(setAuthLoading(true));
      try {
        await apiLogout();
        dispatch(logout());
        return { type: "auth/logout/fulfilled" };
      } catch (error) {
        // Even if API logout fails, still logout locally
        dispatch(logout());
        return { type: "auth/logout/fulfilled" };
      }
    },

    // Initialize auth state - call this on app startup
    initializeAuth: async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        dispatch(setAuthLoading(true));
        try {
          const response = await apiGetProfile();
          dispatch(setUser(response.user));
          return { type: "auth/initialize/fulfilled", payload: response };
        } catch (error) {
          // Token is invalid, clear it
          dispatch(logout());
          return { type: "auth/initialize/rejected" };
        }
      }
      return { type: "auth/initialize/skipped" };
    },
  };
};