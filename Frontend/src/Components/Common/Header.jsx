// Header Component - Main navigation header for the application
// This component contains logo, navigation links, search, and user actions

import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../store/Hooks/Common/hook.useAuth.js";
import { useCart } from "../../store/Hooks/User/hook.useCart.js";
import Button from "./Button.jsx";

/**
 * Header component with navigation, search, and user actions
 * @returns {React.Component} Header component
 */
const Header = () => {
  // Get auth and cart state from Redux
  const { user, isAuthenticated, isAdmin, logoutUser } = useAuth();
  const { itemCount } = useCart();

  // Navigation and routing
  const navigate = useNavigate();
  const location = useLocation();

  // Local state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  /**
   * Handle search form submission
   */
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  /**
   * Check if current route is active
   */
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  /**
   * Toggle mobile menu
   */
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              {/* Logo Icon */}
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              {/* Brand Name */}
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                E-Store
              </span>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              {/* Search Icon */}
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </form>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {/* Navigation Links */}
            <Link
              to="/"
              className={`text-sm font-medium transition-colors duration-200 ${
                isActiveRoute("/")
                  ? "text-primary-600"
                  : "text-gray-700 hover:text-primary-600"
              }`}
            >
              Home
            </Link>

            <Link
              to="/products"
              className={`text-sm font-medium transition-colors duration-200 ${
                isActiveRoute("/products")
                  ? "text-primary-600"
                  : "text-gray-700 hover:text-primary-600"
              }`}
            >
              Products
            </Link>

            {/* Cart Icon with Badge */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-700 hover:text-primary-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6"
                />
              </svg>
              {/* Cart Item Count Badge */}
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>

            {/* User Authentication */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* Admin Panel Link - Only show for admin users */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1 rounded-md"
                  >
                    Admin Panel
                  </Link>
                )}

                {/* User Profile */}
                <Link
                  to="/profile"
                  className="text-sm font-medium text-gray-700 hover:text-primary-600"
                >
                  Hello, {user?.name || "User"}
                </Link>

                {/* Logout Button */}
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                {/* Login Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/login")}
                >
                  Login
                </Button>

                {/* Register Button */}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate("/register")}
                >
                  Register
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-700 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </form>

              {/* Mobile Navigation Links */}
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 text-base font-medium ${
                  isActiveRoute("/")
                    ? "text-primary-600 bg-primary-50"
                    : "text-gray-700"
                }`}
              >
                Home
              </Link>

              <Link
                to="/products"
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 text-base font-medium ${
                  isActiveRoute("/products")
                    ? "text-primary-600 bg-primary-50"
                    : "text-gray-700"
                }`}
              >
                Products
              </Link>

              <Link
                to="/cart"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center px-3 py-2 text-base font-medium text-gray-700"
              >
                Cart
                {itemCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Mobile Authentication */}
              {isAuthenticated ? (
                <div className="space-y-2 pt-2 border-t border-gray-200">
                  {/* Admin Panel Link - Only show for admin users */}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 text-base font-medium text-blue-600 bg-blue-50"
                    >
                      Admin Panel
                    </Link>
                  )}

                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-gray-700"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-red-600"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-2 pt-2 border-t border-gray-200">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-gray-700"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-primary-600"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
