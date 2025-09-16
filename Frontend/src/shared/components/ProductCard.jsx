// Product Card Component - Displays individual product in a card format
// This component is used in product listings, search results, and recommendations

import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import Button from "./Button.jsx";

/**
 * ProductCard component for displaying product information
 * @param {Object} props - Component props
 * @param {Object} props.product - Product data object
 * @param {string} props.product._id - Product ID
 * @param {string} props.product.title - Product title
 * @param {string} props.product.description - Product description
 * @param {Array} props.product.variants - Product variants array
 * @param {number} props.product.rating - Product rating
 * @param {Array} props.product.categories - Product categories
 * @param {string} props.className - Additional CSS classes
 * @returns {React.Component} Product card component
 */
const ProductCard = ({ product, className = "", ...props }) => {
  // Get cart and auth context
  const { addItem, isLoading: cartLoading } = useCart();
  const { isAuthenticated } = useAuth();

  // Handle case where product is null/undefined
  if (!product) {
    return (
      <div className="card p-4 animate-pulse">
        <div className="bg-gray-300 h-48 rounded mb-4"></div>
        <div className="bg-gray-300 h-4 rounded mb-2"></div>
        <div className="bg-gray-300 h-4 rounded w-3/4"></div>
      </div>
    );
  }

  // Get first variant for display (default variant)
  const defaultVariant = product.variants?.[0];
  const firstImage = defaultVariant?.images?.[0];

  // Calculate discounted price if compareAtPrice exists
  const hasDiscount = defaultVariant?.compareAtPrice > defaultVariant?.price;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((defaultVariant.compareAtPrice - defaultVariant.price) /
          defaultVariant.compareAtPrice) *
          100
      )
    : 0;

  /**
   * Handle adding product to cart
   * Uses first variant as default selection
   */
  const handleAddToCart = async () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      alert("Please log in to add items to cart");
      return;
    }

    // Check if product has variants
    if (!defaultVariant) {
      alert("Product variant not available");
      return;
    }

    try {
      // Add item to cart with default quantity of 1
      await addItem({
        productId: product._id,
        variantId: defaultVariant._id,
        quantity: 1,
      });

      // Success feedback could be a toast notification in real app
      console.log("Added to cart successfully");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add item to cart");
    }
  };

  return (
    <div
      className={`card hover:shadow-lg transition-shadow duration-200 ${className}`}
      {...props}
    >
      {/* Product Image */}
      <div className="relative">
        <Link to={`/product/${product._id}`}>
          {firstImage ? (
            <img
              src={firstImage}
              alt={product.title}
              className="w-full h-48 object-cover rounded-t-lg hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
          ) : (
            // Placeholder if no image
            <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </Link>

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
            {discountPercentage}% OFF
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* Wishlist button - you can implement wishlist functionality */}
          <button className="bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-shadow duration-200">
            <svg
              className="w-4 h-4 text-gray-600 hover:text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Product Title */}
        <Link to={`/product/${product._id}`} className="block">
          <h3 className="font-semibold text-lg text-gray-900 hover:text-primary-600 transition-colors duration-200 mb-2 line-clamp-2">
            {product.title}
          </h3>
        </Link>

        {/* Product Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Categories */}
        {product.categories?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.categories.slice(0, 2).map((category, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
              >
                {category}
              </span>
            ))}
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {/* Star Rating */}
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating || 0)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-sm text-gray-600 ml-2">
              ({product.rating?.toFixed(1) || "0.0"})
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">
              ₹{defaultVariant?.price?.toLocaleString() || "0"}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                ₹{defaultVariant.compareAtPrice?.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button
          variant="primary"
          size="sm"
          className="w-full"
          onClick={handleAddToCart}
          loading={cartLoading}
          disabled={!defaultVariant}
        >
          {defaultVariant ? "Add to Cart" : "Out of Stock"}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
