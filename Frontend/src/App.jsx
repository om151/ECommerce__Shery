// App.jsx - Main application component with routing
// This is the root component that sets up routing

import React, { useEffect } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";

// Import layout components
import Footer from "./Components/Common/Footer.jsx";
import Header from "./Components/Common/Header.jsx";

// Import page components
import AdminPanel from "./pages/Admin/AdminPanel.jsx";
import ForgotPassword from "./pages/Common/ForgotPassword.jsx";
import Login from "./pages/Common/Login.jsx";
import Profile from "./pages/Common/Profile.jsx";
import Register from "./pages/Common/Register.jsx";
import ResetPassword from "./pages/Common/ResetPassword.jsx";
import Cart from "./pages/User/Cart.jsx";
import Checkout from "./pages/User/Checkout.jsx";
import Home from "./pages/User/Home.jsx";
import OrderConfirmation from "./pages/User/OrderConfirmation.jsx";
import Product from "./pages/User/Product.jsx";
import Products from "./pages/User/Products.jsx";
import Wishlist from "./pages/User/Wishlist.jsx";

// Import route protection components
import AdminProtectedRoute from "./utils/AdminProtectedRoute.jsx";
import ProtectedRoute from "./utils/ProtectedRoute.jsx";

// Import app initialization hook
import { useAuth } from "./store/Hooks/Common/hook.useAuth.js";
import { useAppInit } from "./store/Hooks/User/hook.useAppInit.js";

/**
 * Main App component - Sets up routing
 * @returns {React.Component} App component
 */
function App() {
  const { initializeApp } = useAppInit();
  const { isAdmin } = useAuth();

  // Initialize app on mount
  useEffect(() => {
    initializeApp();
  }, []);

  return (
    // Router provides routing functionality to entire app
    <Router>
      {/* Main app layout */}
      <div className="min-h-screen flex flex-col">
        {/* Header - Navigation and user actions */}
        <Header />

        {/* Main content area - Pages will render here */}
        <main className="flex-1">
          <Routes>
            {/* Public routes - accessible to all users */}
            <Route
              path="/"
              element={isAdmin ? <Navigate to="/admin" replace /> : <Home />}
            />
            <Route
              path="/products"
              element={
                isAdmin ? <Navigate to="/admin" replace /> : <Products />
              }
            />
            <Route
              path="/product/:id"
              element={isAdmin ? <Navigate to="/admin" replace /> : <Product />}
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/cart"
              element={isAdmin ? <Navigate to="/admin" replace /> : <Cart />}
            />
            <Route
              path="/wishlist"
              element={
                isAdmin ? <Navigate to="/admin" replace /> : <Wishlist />
              }
            />

            {/* Protected routes - require authentication */}
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/order-confirmation/:orderId"
              element={
                <ProtectedRoute>
                  <OrderConfirmation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Admin routes - require admin role */}
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminPanel />
                </AdminProtectedRoute>
              }
            />

            {/* Catch-all route for 404 Not Found */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                      404 - Page Not Found
                    </h1>
                    <p className="text-gray-600">
                      The page you're looking for doesn't exist.
                    </p>
                  </div>
                </div>
              }
            />
          </Routes>
        </main>

        {/* Footer - Site information and links */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
