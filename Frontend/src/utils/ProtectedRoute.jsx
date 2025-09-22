// ProtectedRoute Component - Wrapper for routes that require authentication
// This component checks if user is authenticated before allowing access to protected pages

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import LoadingSpinner from "../Components/Common/LoadingSpinner.jsx";
import { useAuth } from "../store/Hooks/Common/hook.useAuth.js";

/**
 * ProtectedRoute component that requires authentication
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @returns {React.Component} Protected route component
 */
const ProtectedRoute = ({ children }) => {
  // Get authentication state from Redux
  const { isAuthenticated, isLoading } = useAuth();

  // Get current location to redirect back after login
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // If not authenticated, redirect to login with return URL
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If authenticated, render the protected component
  return children;
};

export default ProtectedRoute;
