// Checkout Page - Complete order with payment and shipping
// This page handles the final step of the purchase process

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  applyCoupon,
  createOrder,
  getUserAddresses,
} from "../shared/api/apiService.js";
import Button from "../shared/components/Button.jsx";
import Input from "../shared/components/Input.jsx";
import LoadingSpinner from "../shared/components/LoadingSpinner.jsx";
import { useAuth } from "../shared/context/AuthContext.jsx";
import { useCart } from "../shared/context/CartContext.jsx";

/**
 * Checkout page component
 * @returns {React.Component} Checkout page component
 */
const Checkout = () => {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const { user } = useAuth();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { from: "/checkout" } });
    }
  }, [user, navigate]);

  // Form states
  const [currentStep, setCurrentStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Shipping form
  const [shippingForm, setShippingForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
  });

  // Payment form
  const [paymentForm, setPaymentForm] = useState({
    method: "card", // 'card' or 'paypal'
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Load user addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await getUserAddresses();
        setAddresses(response.data.addresses || []);

        // Select first address as default
        if (response.data.addresses?.length > 0) {
          setSelectedAddressId(response.data.addresses[0]._id);
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [user]);

  // Calculate totals - provide fallback for items
  const cartItems = items || [];
  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum + (item.product?.price || item.price || 0) * item.quantity,
    0
  );
  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
  const discount = (subtotal * couponDiscount) / 100;
  const total = subtotal + tax + shipping - discount;

  /**
   * Handle shipping form input changes
   */
  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handle payment form input changes
   */
  const handlePaymentChange = (e) => {
    const { name, value } = e.target;

    // Format card number and expiry date
    let formattedValue = value;
    if (name === "cardNumber") {
      formattedValue = value
        .replace(/\s/g, "")
        .replace(/(.{4})/g, "$1 ")
        .trim();
    } else if (name === "expiryDate") {
      formattedValue = value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2");
    } else if (name === "cvv") {
      formattedValue = value.replace(/\D/g, "");
    }

    setPaymentForm((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  /**
   * Apply coupon code
   */
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setApplyingCoupon(true);
    setCouponError("");

    try {
      const response = await applyCoupon(couponCode, subtotal);
      setCouponDiscount(response.data.discount);
      setCouponError("");
    } catch (error) {
      console.error("Error applying coupon:", error);
      setCouponError(error.response?.data?.message || "Invalid coupon code");
      setCouponDiscount(0);
    } finally {
      setApplyingCoupon(false);
    }
  };

  /**
   * Move to next step
   */
  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validate shipping info
      if (
        selectedAddressId ||
        (shippingForm.street && shippingForm.city && shippingForm.zipCode)
      ) {
        setCurrentStep(2);
      } else {
        alert("Please fill in all shipping information");
      }
    } else if (currentStep === 2) {
      // Validate payment info
      if (
        paymentForm.method === "paypal" ||
        (paymentForm.cardNumber &&
          paymentForm.expiryDate &&
          paymentForm.cvv &&
          paymentForm.cardholderName)
      ) {
        setCurrentStep(3);
      } else {
        alert("Please fill in all payment information");
      }
    }
  };

  /**
   * Go back to previous step
   */
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  /**
   * Submit order
   */
  const handleSubmitOrder = async () => {
    setIsSubmitting(true);

    try {
      // Prepare shipping address
      let shippingAddress;
      if (selectedAddressId) {
        const selectedAddress = addresses.find(
          (addr) => addr._id === selectedAddressId
        );
        shippingAddress = selectedAddress;
      } else {
        shippingAddress = shippingForm;
      }

      // Prepare order data
      const orderData = {
        items: cartItems.map((item) => ({
          product: item.product?._id || item.productId,
          quantity: item.quantity,
          price: item.product?.price || item.price,
        })),
        shippingAddress,
        paymentMethod: paymentForm.method,
        subtotal,
        tax,
        shipping,
        discount,
        total,
        couponCode: couponCode || undefined,
      };

      // Create order
      const response = await createOrder(orderData);

      // Clear cart
      clearCart();

      // Navigate to order confirmation
      navigate(`/order-confirmation/${response.data.order._id}`, {
        state: { order: response.data.order },
      });
    } catch (error) {
      console.error("Error creating order:", error);
      alert(
        error.response?.data?.message ||
          "Failed to create order. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect if cart is empty
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-8">
            Add some items to your cart before checking out.
          </p>
          <Button onClick={() => navigate("/")}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-heading text-gray-900">
            Checkout
          </h1>

          {/* Progress Steps */}
          <div className="mt-6">
            <nav aria-label="Progress">
              <ol className="flex items-center">
                {[
                  {
                    id: 1,
                    name: "Shipping",
                    href: "#",
                    status:
                      currentStep > 1
                        ? "complete"
                        : currentStep === 1
                        ? "current"
                        : "upcoming",
                  },
                  {
                    id: 2,
                    name: "Payment",
                    href: "#",
                    status:
                      currentStep > 2
                        ? "complete"
                        : currentStep === 2
                        ? "current"
                        : "upcoming",
                  },
                  {
                    id: 3,
                    name: "Review",
                    href: "#",
                    status: currentStep === 3 ? "current" : "upcoming",
                  },
                ].map((step, stepIdx) => (
                  <li
                    key={step.name}
                    className={`${
                      stepIdx !== 2 ? "pr-8 sm:pr-20" : ""
                    } relative`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                          step.status === "complete"
                            ? "bg-primary-600 border-primary-600"
                            : step.status === "current"
                            ? "border-primary-600 bg-white"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {step.status === "complete" ? (
                          <svg
                            className="h-6 w-6 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <span
                            className={`text-sm font-medium ${
                              step.status === "current"
                                ? "text-primary-600"
                                : "text-gray-500"
                            }`}
                          >
                            {step.id}
                          </span>
                        )}
                      </div>
                      <span
                        className={`ml-4 text-sm font-medium ${
                          step.status === "complete" ||
                          step.status === "current"
                            ? "text-primary-600"
                            : "text-gray-500"
                        }`}
                      >
                        {step.name}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <div className="bg-white shadow rounded-lg p-6">
              {/* Step 1: Shipping Information */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Shipping Information
                  </h2>

                  {/* Existing Addresses */}
                  {addresses.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Saved Addresses
                      </h3>
                      <div className="space-y-4">
                        {addresses.map((address) => (
                          <div
                            key={address._id}
                            className="flex items-start space-x-3"
                          >
                            <input
                              id={`address-${address._id}`}
                              name="selectedAddress"
                              type="radio"
                              value={address._id}
                              checked={selectedAddressId === address._id}
                              onChange={(e) =>
                                setSelectedAddressId(e.target.value)
                              }
                              className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                            />
                            <label
                              htmlFor={`address-${address._id}`}
                              className="flex-1 cursor-pointer"
                            >
                              <div className="p-4 border rounded-lg hover:border-primary-300">
                                <div className="font-medium text-gray-900">
                                  {address.name}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {address.street}, {address.city},{" "}
                                  {address.state} {address.zipCode}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {address.phone}
                                </div>
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 pt-6 border-t">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="selectedAddress"
                            value=""
                            checked={selectedAddressId === ""}
                            onChange={(e) => setSelectedAddressId("")}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                          <span className="ml-2 font-medium text-gray-900">
                            Use a new address
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* New Address Form */}
                  {(addresses.length === 0 || selectedAddressId === "") && (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <Input
                          label="Full Name"
                          name="name"
                          value={shippingForm.name}
                          onChange={handleShippingChange}
                          required
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <Input
                          label="Phone Number"
                          name="phone"
                          type="tel"
                          value={shippingForm.phone}
                          onChange={handleShippingChange}
                          required
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <Input
                          label="Street Address"
                          name="street"
                          value={shippingForm.street}
                          onChange={handleShippingChange}
                          required
                        />
                      </div>

                      <Input
                        label="City"
                        name="city"
                        value={shippingForm.city}
                        onChange={handleShippingChange}
                        required
                      />

                      <Input
                        label="State"
                        name="state"
                        value={shippingForm.state}
                        onChange={handleShippingChange}
                        required
                      />

                      <Input
                        label="ZIP Code"
                        name="zipCode"
                        value={shippingForm.zipCode}
                        onChange={handleShippingChange}
                        required
                      />

                      <Input
                        label="Country"
                        name="country"
                        value={shippingForm.country}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Payment Information */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Payment Information
                  </h2>

                  {/* Payment Method Selection */}
                  <div className="mb-6">
                    <fieldset>
                      <legend className="sr-only">Payment method</legend>
                      <div className="space-y-4">
                        {/* Credit Card */}
                        <div className="flex items-center">
                          <input
                            id="payment-card"
                            name="payment-method"
                            type="radio"
                            value="card"
                            checked={paymentForm.method === "card"}
                            onChange={(e) =>
                              setPaymentForm((prev) => ({
                                ...prev,
                                method: e.target.value,
                              }))
                            }
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                          <label htmlFor="payment-card" className="ml-3">
                            <span className="block text-sm font-medium text-gray-700">
                              Credit / Debit Card
                            </span>
                          </label>
                        </div>

                        {/* PayPal */}
                        <div className="flex items-center">
                          <input
                            id="payment-paypal"
                            name="payment-method"
                            type="radio"
                            value="paypal"
                            checked={paymentForm.method === "paypal"}
                            onChange={(e) =>
                              setPaymentForm((prev) => ({
                                ...prev,
                                method: e.target.value,
                              }))
                            }
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                          <label htmlFor="payment-paypal" className="ml-3">
                            <span className="block text-sm font-medium text-gray-700">
                              PayPal
                            </span>
                          </label>
                        </div>
                      </div>
                    </fieldset>
                  </div>

                  {/* Credit Card Form */}
                  {paymentForm.method === "card" && (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <Input
                          label="Cardholder Name"
                          name="cardholderName"
                          value={paymentForm.cardholderName}
                          onChange={handlePaymentChange}
                          required
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <Input
                          label="Card Number"
                          name="cardNumber"
                          value={paymentForm.cardNumber}
                          onChange={handlePaymentChange}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          required
                        />
                      </div>

                      <Input
                        label="Expiry Date"
                        name="expiryDate"
                        value={paymentForm.expiryDate}
                        onChange={handlePaymentChange}
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                      />

                      <Input
                        label="CVV"
                        name="cvv"
                        value={paymentForm.cvv}
                        onChange={handlePaymentChange}
                        placeholder="123"
                        maxLength={4}
                        required
                      />
                    </div>
                  )}

                  {/* PayPal Notice */}
                  {paymentForm.method === "paypal" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                      <div className="flex">
                        <svg
                          className="flex-shrink-0 h-5 w-5 text-blue-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div className="ml-3">
                          <p className="text-sm text-blue-800">
                            You will be redirected to PayPal to complete your
                            payment.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Review Order */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Review Your Order
                  </h2>

                  {/* Order Items */}
                  <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <div
                        key={item.product?._id || item.productId}
                        className="p-4 flex items-center space-x-4"
                      >
                        <img
                          src={
                            item.product?.image ||
                            item.image ||
                            "/api/placeholder/60/60"
                          }
                          alt={item.product?.name || item.name || "Product"}
                          className="w-15 h-15 object-cover rounded-md"
                        />
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">
                            {item.product?.name || item.name || "Product"}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          $
                          {(
                            (item.product?.price || item.price || 0) *
                            item.quantity
                          ).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Address */}
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Shipping Address
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {selectedAddressId ? (
                        (() => {
                          const address = addresses.find(
                            (addr) => addr._id === selectedAddressId
                          );
                          return address ? (
                            <div>
                              <p className="font-medium">{address.name}</p>
                              <p>{address.street}</p>
                              <p>
                                {address.city}, {address.state}{" "}
                                {address.zipCode}
                              </p>
                              <p>{address.phone}</p>
                            </div>
                          ) : null;
                        })()
                      ) : (
                        <div>
                          <p className="font-medium">{shippingForm.name}</p>
                          <p>{shippingForm.street}</p>
                          <p>
                            {shippingForm.city}, {shippingForm.state}{" "}
                            {shippingForm.zipCode}
                          </p>
                          <p>{shippingForm.phone}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Payment Method
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {paymentForm.method === "card" ? (
                        <p>
                          Credit Card ending in{" "}
                          {paymentForm.cardNumber.slice(-4)}
                        </p>
                      ) : (
                        <p>PayPal</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-8 flex justify-between">
                <Button
                  variant="outline"
                  onClick={handlePreviousStep}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>

                {currentStep < 3 ? (
                  <Button variant="primary" onClick={handleNextStep}>
                    Next
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={handleSubmitOrder}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Placing Order..." : "Place Order"}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white shadow rounded-lg p-6 sticky top-8">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                Order Summary
              </h2>

              {/* Coupon Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Code
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="input-base flex-1"
                    placeholder="Enter coupon code"
                  />
                  <Button
                    variant="outline"
                    onClick={handleApplyCoupon}
                    loading={applyingCoupon}
                    disabled={!couponCode.trim() || applyingCoupon}
                  >
                    Apply
                  </Button>
                </div>
                {couponError && (
                  <p className="text-sm text-red-600 mt-1">{couponError}</p>
                )}
                {couponDiscount > 0 && (
                  <p className="text-sm text-green-600 mt-1">
                    {couponDiscount}% discount applied!
                  </p>
                )}
              </div>

              {/* Order Breakdown */}
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Discount ({couponDiscount}%)
                    </span>
                    <span className="font-medium text-green-600">
                      -${discount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium text-gray-900">
                    ${tax.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-gray-900">
                    {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
