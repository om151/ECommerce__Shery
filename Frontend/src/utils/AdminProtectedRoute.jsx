// AdminProtectedRoute.jsx - Route protection for admin-only pages
// This component ensures only users with admin role can access protected routes

import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import LoadingSpinner from "../Components/Common/LoadingSpinner.jsx";
import {
  selectIsAdmin,
  selectIsAuthenticated,
  selectIsLoading,
} from "../store/slices/Common/authSlice.js";

/**
 * AdminProtectedRoute component - Protects routes that require admin access
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @returns {React.Component} Protected route component
 */
const AdminProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const isLoading = useSelector(selectIsLoading);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to home if authenticated but not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // User is authenticated and has admin role, render the protected content
  return children;
};

export default AdminProtectedRoute;
