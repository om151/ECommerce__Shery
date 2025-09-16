// App.jsx - Main application component with routing and global providers
// This is the root component that sets up routing and global state

import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

// Import context providers
import { AuthProvider } from "./shared/context/AuthContext.jsx";
import { CartProvider } from "./shared/context/CartContext.jsx";

// Import layout components
import Footer from "./shared/components/Footer.jsx";
import Header from "./shared/components/Header.jsx";

// Import page components
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Product from "./pages/Product.jsx";
import Profile from "./pages/Profile.jsx";
import Register from "./pages/Register.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";

// Import route protection component
import ProtectedRoute from "./shared/components/ProtectedRoute.jsx";

/**
 * Main App component - Sets up routing and global providers
 * @returns {React.Component} App component
 */
function App() {
  return (
    // Router provides routing functionality to entire app
    <Router>
      {/* AuthProvider manages global authentication state */}
      <AuthProvider>
        {/* CartProvider manages global cart state */}
        <CartProvider>
          {/* Main app layout */}
          <div className="min-h-screen flex flex-col">
            {/* Header - Navigation and user actions */}
            <Header />

            {/* Main content area - Pages will render here */}
            <main className="flex-1">
              <Routes>
                {/* Public routes - accessible to all users */}
                <Route path="/" element={<Home />} />
                <Route path="/product/:id" element={<Product />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/cart" element={<Cart />} />

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
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
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
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
