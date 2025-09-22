// Cart Page - Shopping cart with items management
// This page displays cart items and allows quantity updates, item removal, and checkout

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../Components/Common/Button.jsx";
import ClearCartButton from "../../Components/Common/ClearCartButton.jsx";
import { useAuth } from "../../store/Hooks/Common/hook.useAuth.js";
import { useCart } from "../../store/Hooks/User/hook.useCart.js";

/**
 * Cart page component
 * @returns {React.Component} Cart page component
 */
const Cart = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, clearCart, isLoading } =
    useCart();
  const { user } = useAuth();

  /**
   * Update item quantity in cart
   * @param {string} productId - Product ID
   * @param {string} variantId - Variant ID
   * @param {number} newQuantity - New quantity
   */
  const handleUpdateQuantity = (productId, variantId, newQuantity) => {
    if (newQuantity <= 0) {
      // Remove item if quantity is 0 or less
      handleRemoveItem(productId, variantId);
      return;
    }

    // Use the Redux action to update item
    updateQuantity({ productId, variantId, quantity: newQuantity });
  };

  /**
   * Remove item from cart
   * @param {string} productId - Product ID to remove
   * @param {string} variantId - Variant ID to remove
   */
  const handleRemoveItem = (productId, variantId) => {
    // Use the Redux action to remove item
    removeFromCart({ productId, variantId });
  };

  /**
   * Clear all items from cart
   */
  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      clearCart();
    }
  };

  /**
   * Proceed to checkout
   */
  const handleCheckout = () => {
    if (!user) {
      // Save current page for redirect after login
      navigate("/login", { state: { from: "/cart" } });
      return;
    }

    navigate("/checkout");
  };

  // Calculate cart totals - provide fallback for items
  const cartItems = items || [];

  const subtotal = cartItems.reduce((sum, item) => {
    // Use totalPrice from backend if available, otherwise calculate from variant price
    if (item.totalPrice) {
      return sum + item.totalPrice;
    }
    // Fallback to variant price * quantity
    const price = item.variant?.price || item.variantId?.price || 0;
    return sum + price * item.quantity;
  }, 0);
  const tax = 0; // 8% tax rate
  const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
  const total = subtotal + tax + shipping;

  // Empty cart state
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto text-center">
            {/* Empty Cart Illustration */}
            <div className="w-32 h-32 mx-auto mb-8 bg-gray-200 rounded-full flex items-center justify-center">
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
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.68 8.36a2 2 0 001.95 2.64h9.46a2 2 0 001.95-2.64L15 13"
                />
              </svg>
            </div>

            <h1 className="text-3xl font-bold font-heading text-gray-900 mb-4">
              Your cart is empty
            </h1>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>

            <div className="space-y-4">
              <Link to="/">
                <Button variant="primary" size="lg" className="w-full">
                  Continue Shopping
                </Button>
              </Link>

              {user && (
                <Link to="/wishlist">
                  <Button variant="outline" size="lg" className="w-full">
                    View Wishlist
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  console.log(cartItems);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-heading text-gray-900">
            Shopping Cart
          </h1>
          <p className="mt-2 text-gray-600">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in
            your cart
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Cart Items Section */}
          <div className="lg:col-span-8">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              {/* Cart Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">
                  Cart Items
                </h2>
                <ClearCartButton />
              </div>

              {/* Cart Items List */}
              <div className="divide-y divide-gray-200">
                {cartItems.map((item, index) => (
                  <div
                    key={item.product?._id || item.productId || index}
                    className="px-6 py-6"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-20 h-20">
                        <img
                          src={
                            item.variant?.images?.[0] ||
                            item.variantId?.images?.[0] ||
                            item.product?.variants?.[0]?.images?.[0] ||
                            "/api/placeholder/80/80"
                          }
                          alt={item.product?.title || "Product"}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 pr-6">
                            <Link
                              to={`/product/${
                                item.product?._id || item.productId
                              }`}
                              className="text-lg font-medium text-gray-900 hover:text-primary-600"
                            >
                              {item.product?.title || "Product"}
                            </Link>

                            {item.product?.categories?.[0] && (
                              <p className="text-sm text-gray-500 mt-1">
                                Category: {item.product.categories[0]}
                              </p>
                            )}

                            <p className="text-lg font-semibold text-gray-900 mt-2">
                              ₹
                              {item.variant?.price ||
                                item.variantId?.price ||
                                item.totalPrice / item.quantity ||
                                0}
                            </p>

                            {/* Variant Info */}
                            {(item.variant?.attributes ||
                              item.variantId?.attributes) && (
                              <div className="text-sm text-gray-500 mt-1">
                                {item.variant?.attributes?.color && (
                                  <span>
                                    Color: {item.variant.attributes.color}{" "}
                                  </span>
                                )}
                                {item.variant?.attributes?.size && (
                                  <span>
                                    Size: {item.variant.attributes.size}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Quantity and Remove */}
                          <div className="flex flex-col items-end space-y-3">
                            {/* Quantity Selector */}
                            <div className="flex items-center border border-gray-300 rounded-md">
                              <button
                                type="button"
                                className="px-3 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.product?._id || item.productId,
                                    item.variantId?._id || item.variantId,
                                    item.quantity - 1
                                  )
                                }
                                disabled={item.quantity <= 1}
                              >
                                -
                              </button>
                              <span className="px-3 py-1 min-w-[3rem] text-center border-x border-gray-300 text-sm font-medium">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                className="px-3 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.product?._id || item.productId,
                                    item.variantId?._id || item.variantId,
                                    item.quantity + 1
                                  )
                                }
                                disabled={
                                  item.quantity >=
                                  (item.variant?.inventoryId
                                    ?.quantityAvailable || 0)
                                }
                              >
                                +
                              </button>
                            </div>

                            {/* Item Total */}
                            <p className="text-lg font-semibold text-gray-900">
                              ₹
                              {item.totalPrice
                                ? item.totalPrice.toFixed(2)
                                : (
                                    (item.variant?.price ||
                                      item.variantId?.price ||
                                      0) * item.quantity
                                  ).toFixed(2)}
                            </p>

                            {/* Remove Button */}
                            <button
                              onClick={() =>
                                handleRemoveItem(
                                  item.product?._id || item.productId,
                                  item.variantId?._id || item.variantId
                                )
                              }
                              className="flex items-center text-sm text-red-600 hover:text-red-800 font-medium"
                            >
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white shadow rounded-lg p-6 sticky top-8">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                Order Summary
              </h2>

              {/* Order Details */}
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Subtotal ({cartItems.length} items)
                  </span>
                  <span className="font-medium text-gray-900">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium text-gray-900">
                    ₹{tax.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-gray-900">
                    {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>

                {/* Free Shipping Notice */}
                {subtotal < 100 && (
                  <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-md">
                    Add ₹{(100 - subtotal).toFixed(2)} more for free shipping!
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 space-y-3">
                <Button
                  onClick={handleCheckout}
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={cartItems.some(
                    (item) =>
                      (item.variant?.inventoryId?.quantityAvailable || 0) === 0
                  )}
                >
                  {!user ? "Sign In to Checkout" : "Proceed to Checkout"}
                </Button>

                <Link to="/">
                  <Button variant="outline" size="lg" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>

              {/* Security Notice */}
              <div className="mt-6 flex items-center text-sm text-gray-500">
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span>Secure SSL encrypted checkout</span>
              </div>

              {/* Payment Methods */}
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">We accept:</p>
                <div className="flex space-x-2">
                  <div className="w-8 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                    VISA
                  </div>
                  <div className="w-8 h-6 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">
                    MC
                  </div>
                  <div className="w-8 h-6 bg-blue-800 rounded text-white text-xs flex items-center justify-center font-bold">
                    AMEX
                  </div>
                  <div className="w-8 h-6 bg-yellow-500 rounded text-white text-xs flex items-center justify-center font-bold">
                    PP
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold font-heading text-gray-900 mb-8">
            You might also like
          </h2>

          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">
              Product recommendations will be displayed here based on your cart
              items.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
