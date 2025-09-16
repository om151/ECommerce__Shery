// Authentication Context - Global state management for user authentication
// This file creates React Context for managing user authentication state

import { createContext, useContext, useEffect, useReducer } from "react";
import {
  loginUser as apiLogin,
  logoutUser as apiLogout,
  getUserProfile,
} from "../api/apiService.js";

// Create Authentication Context
const AuthContext = createContext();

// Auth action types - defines all possible auth operations
const AUTH_ACTIONS = {
  SET_LOADING: "SET_LOADING", // Set loading state
  SET_ERROR: "SET_ERROR", // Set error state
  LOGIN_SUCCESS: "LOGIN_SUCCESS", // User successfully logged in
  LOGOUT: "LOGOUT", // User logged out
  SET_USER: "SET_USER", // Set user data
  CLEAR_ERROR: "CLEAR_ERROR", // Clear error state
};

// Initial authentication state
const initialAuthState = {
  user: null, // Current user data
  token: null, // Authentication token
  isAuthenticated: false, // Whether user is logged in
  isLoading: !!localStorage.getItem("authToken"), // Loading state - true if we need to check existing token
  error: null, // Error message if any
};

// Auth reducer function - handles all authentication state updates
const authReducer = (state, action) => {
  switch (action.type) {
    // Set loading state
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
        error: null,
      };

    // Set error state
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    // Clear error state
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    // User successfully logged in
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      const { user, token } = action.payload;
      return {
        ...state,
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    // Set user data (for profile updates)
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isLoading: false,
        error: null,
      };

    // User logged out
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialAuthState,
      };

    default:
      return state;
  }
};

// Auth Provider Component - wraps app and provides auth state/actions
export const AuthProvider = ({ children }) => {
  // Initialize auth reducer
  const [authState, dispatch] = useReducer(authReducer, initialAuthState);

  // Check for existing authentication on app load
  useEffect(() => {
    checkExistingAuth();
  }, []);

  // ==========================================================================
  // AUTHENTICATION ACTIONS - Functions that components can call
  // ==========================================================================

  /**
   * Check if user is already authenticated (from localStorage)
   */
  const checkExistingAuth = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem("authToken");

      if (token) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

        // Verify token by getting user profile
        const userData = await getUserProfile();

        // If successful, update auth state
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user: userData.user, token },
        });
      }
    } catch (error) {
      // Token is invalid, remove it
      localStorage.removeItem("authToken");
      console.error("Invalid token found, removing:", error);
    } finally {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  /**
   * Login user with email and password
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   */
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      // Call login API
      const response = await apiLogin(credentials);

      // Store token in localStorage
      localStorage.setItem("authToken", response.token);

      // Update auth state
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user: response.user, token: response.token },
      });

      return response;
    } catch (error) {
      console.error("Login error:", error);
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: error.response?.data?.message || "Login failed",
      });
      throw error;
    }
  };

  /**
   * Logout current user
   */
  const logout = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      // Call logout API (optional, for token blacklisting)
      try {
        await apiLogout();
      } catch (error) {
        // Ignore API errors for logout, still proceed with local logout
        console.warn("Logout API call failed:", error);
      }

      // Remove token from localStorage
      localStorage.removeItem("authToken");

      // Update auth state
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    } catch (error) {
      console.error("Logout error:", error);
      // Still logout locally even if API call fails
      localStorage.removeItem("authToken");
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  /**
   * Update user profile data
   * @param {Object} userData - Updated user data
   */
  const updateUser = (userData) => {
    dispatch({ type: AUTH_ACTIONS.SET_USER, payload: userData });
  };

  /**
   * Clear authentication error
   */
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Context value object - all data and functions available to consuming components
  const contextValue = {
    // Auth state
    ...authState,

    // Auth actions
    login,
    logout,
    updateUser,
    clearError,
    checkExistingAuth,
  };

  // Provide context value to all child components
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Custom hook to use auth context
// This hook can be imported and used in any component that needs auth functionality
export const useAuth = () => {
  const context = useContext(AuthContext);

  // Ensure hook is used within AuthProvider
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

// Export context for advanced use cases
export { AuthContext };
