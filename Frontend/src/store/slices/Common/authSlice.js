// Authentication Slice - Redux Toolkit slice for user authentication
// Handles login, logout, user profile, and authentication state

import { createSlice } from "@reduxjs/toolkit";

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem("authToken"),
  isAuthenticated: !!localStorage.getItem("authToken"),
  isLoading: false,
  error: null,
};

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    // Set error
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Login success
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;

      // Store token in localStorage
      if (action.payload.token) {
        localStorage.setItem("authToken", action.payload.token);
      }
    },

    // Registration success
    registerSuccess: (state, action) => {
      // state.user = action.payload.user;
      // state.token = action.payload.token;
      // state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;

      // Store token in localStorage
      if (action.payload.token) {
        localStorage.setItem("authToken", action.payload.token);
      }
    },

    // Logout
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;

      // Remove token from localStorage
      localStorage.removeItem("authToken");
    },

    // Update user profile
    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      state.isLoading = false;
      state.error = null;
    },

    // Set user profile (for initial load)
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
  },
});

// Export actions
export const {
  setLoading,
  setError,
  clearError,
  loginSuccess,
  registerSuccess,
  logout,
  updateProfile,
  setUser,
} = authSlice.actions;

// Selectors for easy state access
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;

// Helper selectors for role-based access
export const selectUserRole = (state) => state.auth.user?.role;
export const selectIsAdmin = (state) => state.auth.user?.role === "admin";
export const selectIsUser = (state) => state.auth.user?.role === "user";

// Export reducer
export default authSlice.reducer;
