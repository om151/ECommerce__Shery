// Wishlist Page - User's saved products
// This page displays all products that user has added to their wishlist

import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../Components/Common/Button.jsx";
import LoadingSpinner from "../../Components/Common/LoadingSpinner.jsx";
import { useAuth } from "../../store/Hooks/Common/hook.useAuth.js";
import { useCart } from "../../store/Hooks/User/hook.useCart.js";
import { useWishlist } from "../../store/Hooks/User/hook.useWishlist.js";

/**
 * Wishlist page component
 * @returns {React.Component} Wishlist page component
 */
const Wishlist = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const {
    items,
    itemCount,
    isLoading,
    error,
    fetchWishlist,
    removeFromWishlist,
    clearWishlistError,
  } = useWishlist();

  // Fetch wishlist on component mount
  useEffect(() => {
    if (user) {
      fetchWishlist().catch(console.error);
    }
  }, [user]);

  // Handle remove from wishlist
  const handleRemoveFromWishlist = async (productId) => {
    try {
      await removeFromWishlist(productId);
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  // Handle add to cart
  const handleAddToCart = async (product) => {
    if (!product.variants || product.variants.length === 0) {
      alert("Product is not available");
      return;
    }

    try {
      await addToCart({
        productId: product._id,
        variantId: product.variants[0]._id,
        quantity: 1,
      });
      alert(`${product.title} added to cart!`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add product to cart");
    }
  };

  // Handle buy now
  const handleBuyNow = async (product) => {
    await handleAddToCart(product);
    navigate("/checkout");
  };

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Sign in to view your wishlist
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You need to be logged in to save and view your favorite products.
            </p>
            <div className="space-x-4">
              <Button onClick={() => navigate("/login")}>Sign In</Button>
              <Button variant="outline" onClick={() => navigate("/register")}>
                Create Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
              <p className="text-gray-600 mt-2">
                {itemCount > 0
                  ? `${itemCount} items saved`
                  : "No items saved yet"}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/products")}
              className="flex items-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Continue Shopping
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-red-600 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="text-red-800 font-medium">
                  Error loading wishlist
                </h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearWishlistError}
                className="ml-auto"
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && itemCount === 0 && (
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-16 h-16 text-gray-400"
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
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Your wishlist is empty
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start browsing and save your favorite products to your wishlist.
              They'll appear here so you can easily find them later.
            </p>
            <Button onClick={() => navigate("/products")}>
              Start Shopping
            </Button>
          </div>
        )}

        {/* Wishlist Items Grid */}
        {!isLoading && !error && itemCount > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((wishlistItem) => {
              const product = wishlistItem.product;
              const firstVariant = product.variants?.[0];
              const firstImage =
                firstVariant?.images?.[0] || "/api/placeholder/300/300";

              // Debug: Log the variant and inventory data
              console.log("Wishlist item:", {
                productTitle: product.title,
                hasVariants: !!product.variants,
                variantsLength: product.variants?.length,
                firstVariant: firstVariant,
                hasInventoryId: !!firstVariant?.inventoryId,
                inventoryData: firstVariant?.inventoryId,
              });

              const isInStock =
                firstVariant?.inventoryId?.quantityAvailable > 0;

              return (
                <div
                  key={wishlistItem._id || product._id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <Link to={`/product/${product._id}`}>
                      <img
                        src={firstImage}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    {/* Remove from Wishlist Button */}
                    <button
                      onClick={() => handleRemoveFromWishlist(product._id)}
                      className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-red-500 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Remove from wishlist"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {/* Stock Badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          isInStock
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {isInStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    {/* Brand */}
                    {product.attributes?.brand && (
                      <p className="text-xs font-medium text-indigo-600 mb-1">
                        {product.attributes.brand}
                      </p>
                    )}

                    {/* Title */}
                    <Link to={`/product/${product._id}`}>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-indigo-600 transition-colors">
                        {product.title}
                      </h3>
                    </Link>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-lg font-bold text-gray-900">
                          ${firstVariant?.price || 0}
                        </span>
                        {firstVariant?.compareAtPrice &&
                          firstVariant.compareAtPrice > firstVariant.price && (
                            <span className="text-sm text-gray-500 line-through">
                              ${firstVariant.compareAtPrice}
                            </span>
                          )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <Button
                        onClick={() => handleAddToCart(product)}
                        disabled={!isInStock}
                        className="w-full"
                        size="sm"
                      >
                        Add to Cart
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleBuyNow(product)}
                        disabled={!isInStock}
                        className="w-full"
                        size="sm"
                      >
                        Buy Now
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Recommendations Section */}
        {!isLoading && !error && itemCount > 0 && (
          <div className="mt-16 pt-8 border-t border-gray-200">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                You might also like
              </h3>
              <Button
                variant="outline"
                onClick={() => navigate("/products")}
                className="inline-flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-2"
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
                Discover More Products
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
