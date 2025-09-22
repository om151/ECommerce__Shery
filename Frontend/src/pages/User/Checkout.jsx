import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getUserAddresses } from "../../shared/api/User/address.apiService.js";
import { validateCoupon } from "../../shared/api/User/coupon.apiService.js";
import {
  processPayment,
  verifyPayment,
} from "../../shared/api/User/payment.apiService.js";
import { useCart } from "../../store/Hooks/User/hook.useCart.js";
import { useOrders } from "../../store/Hooks/User/hook.useOrder.js";

const Checkout = () => {
  const navigate = useNavigate();
  const { items: cartItems, itemCount, clearCart } = useCart();
  const { createOrder } = useOrders();
  const user = useSelector((state) => state.auth.user);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");
  const [failedOrderId, setFailedOrderId] = useState(null); // Track failed payment order

  // Coupon related state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  // Calculate totals (removed tax)
  const subtotal = cartItems.reduce((sum, item) => {
    // Use totalPrice from backend if available, otherwise calculate from available price sources
    if (item.totalPrice) {
      return sum + item.totalPrice;
    }
    // Try different price sources in order of preference
    const price = item.variant?.price || item.product?.price || item.price || 0;
    return sum + price * item.quantity;
  }, 0);
  const total = subtotal - couponDiscount; // Apply coupon discount

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await getUserAddresses();

      // Handle different response structures
      const addressList =
        response.data?.addresses || response.addresses || response.data || [];

      setAddresses(addressList);
      // Select first address by default
      if (addressList.length > 0) {
        setSelectedAddress(addressList[0]._id);
      }
    } catch (error) {
      console.error("🏠 CHECKOUT DEBUG - Address fetch error:", error);
      setError(
        "Failed to fetch addresses: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setCouponLoading(true);
    setCouponError("");

    try {
      // Get product IDs from cart items
      const productIds = cartItems
        .map((item) => item.product?._id || item.productId)
        .filter((id) => id);

      const response = await validateCoupon(
        couponCode.trim().toUpperCase(),
        subtotal,
        productIds
      );

      if (response.valid) {
        // Backend returns 'valid' not 'success' or 'isValid'
        const discountAmount = response.discountAmount || 0;
        const couponData = {
          id: response.coupon?._id,
          code: couponCode.toUpperCase(),
          discountAmount: discountAmount,
          discountType: response.coupon?.discountType,
          discountValue:
            response.coupon?.percentage || response.coupon?.maxDiscount,
          description: response.coupon?.description,
          minOrderAmount: response.coupon?.minOrderValue,
          maxDiscountAmount: response.coupon?.maxDiscount,
        };

        setAppliedCoupon(couponData);
        setCouponDiscount(discountAmount);
        setCouponError("");
      } else {
        throw new Error(response.message || "Invalid coupon code");
      }
    } catch (error) {
      // Extract specific error message from different response formats
      let errorMessage =
        "Failed to validate coupon. Please check the code and try again.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Handle specific error cases with user-friendly messages
      if (errorMessage.toLowerCase().includes("expired")) {
        errorMessage = "⏰ This coupon has expired. Try another code.";
      } else if (errorMessage.toLowerCase().includes("not yet valid")) {
        errorMessage =
          "⏳ This coupon is not yet active. Please try again later.";
      } else if (errorMessage.toLowerCase().includes("usage limit")) {
        errorMessage = "🔒 This coupon has reached its usage limit.";
      } else if (errorMessage.toLowerCase().includes("minimum order")) {
        errorMessage = `💰 Your order doesn't meet the minimum amount for this coupon.`;
      } else if (errorMessage.toLowerCase().includes("not applicable")) {
        errorMessage =
          "🚫 This coupon cannot be applied to your current items.";
      } else if (errorMessage.toLowerCase().includes("invalid coupon")) {
        errorMessage = "❌ Invalid coupon code. Please check and try again.";
      }

      setCouponError(errorMessage);
      setAppliedCoupon(null);
      setCouponDiscount(0);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponError("");
  };

  // Format phone number for Razorpay (Indian phone numbers only)
  const formatPhoneForRazorpay = (phone) => {
    if (!phone) return "";

    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, "");

    // Check if it's already in Indian format
    if (cleanPhone.startsWith("91") && cleanPhone.length === 12) {
      return cleanPhone; // Already in +91XXXXXXXXXX format
    }

    // Check if it's a 10-digit Indian number
    if (cleanPhone.length === 10 && cleanPhone.match(/^[6-9]/)) {
      return "91" + cleanPhone; // Add country code
    }

    // Check if it starts with 0 (remove leading 0 for Indian numbers)
    if (cleanPhone.length === 11 && cleanPhone.startsWith("0")) {
      const withoutZero = cleanPhone.substring(1);
      if (withoutZero.match(/^[6-9]/)) {
        return "91" + withoutZero;
      }
    }

    // For international numbers or invalid formats, return empty string
    // This prevents Razorpay from rejecting international numbers
    // console.log(
    //   "🌍 PHONE DEBUG - International or invalid phone number, not prefilling:",
    //   phone
    // );
    return "";
  };

  // Retry payment for an existing order
  const handleRetryPayment = async () => {
    if (!failedOrderId) {
      setError("No failed order to retry payment for.");
      return;
    }

    setError("");
    setPaymentLoading(true);

    try {
      const paymentResult = await handlePayment(failedOrderId, total);

      if (paymentResult.success) {
        // Payment successful - redirect to order confirmation
        setFailedOrderId(null);
        navigate(`/order-confirmation/${failedOrderId}`, {
          state: {
            paymentId: paymentResult.paymentId,
            paymentMethod,
            isRetry: true,
          },
        });
      }
    } catch (error) {
      setError(`Payment retry failed: ${error.message}`);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePayment = async (orderId, amount) => {
    try {
      if (paymentMethod === "ONLINE") {
        const paymentResponse = await processPayment(orderId, "card");

        if (paymentResponse && paymentResponse.razorpayOrderId) {
          // Initialize Razorpay payment
          return await initiateRazorpayPayment(paymentResponse);
        } else {
          throw new Error("Invalid payment response from server");
        }
      } else {
        // COD - process through backend for consistency
        const paymentResponse = await processPayment(orderId, "cod");
        return { success: true, paymentId: paymentResponse.payment?._id };
      }
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Payment processing failed"
      );
    }
  };

  const initiateRazorpayPayment = (paymentData) => {
    return new Promise((resolve, reject) => {
      if (!window.Razorpay) {
        reject(
          new Error("Razorpay SDK not loaded. Please refresh and try again.")
        );
        return;
      }

      const options = {
        key: paymentData.keyId,
        amount: paymentData.amount, // Amount in paise
        currency: paymentData.currency,
        name: "Your E-commerce Store",
        description: `Order Payment`,
        order_id: paymentData.razorpayOrderId,
        handler: async function (response) {
          try {
            // Verify payment on backend
            const verificationData = {
              orderId: paymentData.order._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            };

            const verificationResponse = await verifyPayment(
              verificationData.orderId,
              verificationData
            );

            if (verificationResponse && verificationResponse.order) {
              resolve({
                success: true,
                paymentId: response.razorpay_payment_id,
                orderId: paymentData.order._id,
              });
            } else {
              reject(new Error("Payment verification failed"));
            }
          } catch (error) {
            reject(new Error("Payment verification failed: " + error.message));
          }
        },
        modal: {
          ondismiss: function () {
            reject(new Error("Payment cancelled by user"));
          },
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          // Only include contact if it's in Indian format (starts with +91 or is 10 digits)
          contact: formatPhoneForRazorpay(user?.phone || ""),
        },
        theme: {
          color: "#3B82F6",
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        reject(new Error(`Payment failed: ${response.error.description}`));
      });

      rzp.open();
    });
  };

  const handleCheckout = async () => {
    // If there's a failed order, don't create a new order - just retry payment
    if (failedOrderId && paymentMethod === "ONLINE") {
      await handleRetryPayment();
      return;
    }

    if (!selectedAddress) {
      setError("Please select a shipping address");
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty");
      return;
    }

    setLoading(true);
    setError("");
    setFailedOrderId(null); // Clear any previous failed order

    try {
      // Prepare order data
      // console.log(
      //   "📦 CHECKOUT DEBUG - Preparing order data with cart items:",
      //   cartItems
      // );
      const orderData = {
        items: cartItems.map((item) => {
          const price =
            item.variant?.price || item.product?.price || item.price || 0;

          const orderItem = {
            productId: item.product?._id || item.productId,
            title: item.product?.name || item.name || "Product",
            quantity: item.quantity,
            unitPrice: price,
            totalPrice: price * item.quantity,
          };

          // Only add variantId and variantName if variant exists
          if (item.variant?._id || item.variantId) {
            orderItem.variantId = item.variant?._id || item.variantId;
          }
          if (item.variant?.name || item.variantName) {
            orderItem.variantName = item.variant?.name || item.variantName;
          }

          return orderItem;
        }),
        shippingAddress: selectedAddress,
        currency: "INR",
        shippingFee: 0,
        tax: 0,
        orderDiscount: couponDiscount,
        // Add complete coupon information if applied
        ...(appliedCoupon && {
          couponCode: appliedCoupon.code,
          couponId: appliedCoupon.id,
          couponDiscount: appliedCoupon.discountAmount,
          couponType: appliedCoupon.discountType,
          couponValue: appliedCoupon.discountValue,
        }),
      };

      // console.log(
      //   "📦 CHECKOUT DEBUG - Final order data with coupon:",
      //   orderData
      // );

      // Create order
      const orderResponse = await createOrder(orderData);

      if (orderResponse.payload?.order || orderResponse.payload?.data) {
        const order = orderResponse.payload.order || orderResponse.payload.data;
        const orderId = order._id;

        try {
          // Process payment
          setPaymentLoading(true);
          const paymentResult = await handlePayment(orderId, total);

          if (paymentResult.success) {
            // Clear cart after successful order and payment
            clearCart();

            // Redirect to order confirmation
            navigate(`/order-confirmation/${orderId}`, {
              state: {
                orderData: order,
                paymentId: paymentResult.paymentId,
                paymentMethod,
              },
            });
          }
        } catch (paymentError) {
          // Payment failed, but order was created

          const errorMessage =
            paymentError.message || "Payment processing failed";
          setFailedOrderId(orderId); // Store the failed order ID for retry

          // Provide user-friendly error messages and options
          if (errorMessage.includes("cancelled by user")) {
            setError(
              `Payment was cancelled. Your order (#${orderId.slice(
                -8
              )}) is created but not paid. You can retry payment or choose Cash on Delivery.`
            );
          } else if (errorMessage.includes("verification failed")) {
            setError(
              `Payment verification failed. Please contact support with Order ID: #${orderId.slice(
                -8
              )}`
            );
          } else if (errorMessage.includes("Razorpay SDK not loaded")) {
            setError(
              "Payment gateway is not available. Please refresh the page and try again, or choose Cash on Delivery."
            );
          } else if (
            errorMessage.includes("international phone number") ||
            errorMessage.includes("Indian phone number")
          ) {
            setError(
              `Payment failed due to phone number restriction. Your order (#${orderId.slice(
                -8
              )}) is created. Please update your profile with an Indian phone number (+91XXXXXXXXXX) and retry, or choose Cash on Delivery.`
            );
          } else {
            setError(
              `Order created but payment failed: ${errorMessage}. Order ID: #${orderId.slice(
                -8
              )}. You can retry payment or choose Cash on Delivery.`
            );
          }

          // For online payment failures, suggest switching to COD
          if (paymentMethod === "ONLINE") {
            setTimeout(() => {
              if (
                window.confirm(
                  "Would you like to change to Cash on Delivery for this order?"
                )
              ) {
                setPaymentMethod("COD");
                setError("");
              }
            }, 3000);
          }
        } finally {
          setPaymentLoading(false);
        }
      } else {
        throw new Error("Invalid order response format");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Please log in to checkout</h2>
        <button
          onClick={() => navigate("/login")}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <button
          onClick={() => navigate("/products")}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <div className="mb-3">{error}</div>

          {/* Retry Payment Options */}
          {failedOrderId && (
            <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-red-200">
              <button
                onClick={handleRetryPayment}
                disabled={paymentLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paymentLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Retrying Payment...</span>
                  </>
                ) : (
                  <>
                    <span>💳</span>
                    <span>Retry Payment</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setPaymentMethod("COD");
                  setFailedOrderId(null);
                  setError("");
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <span>🚚</span>
                <span>Switch to COD</span>
              </button>

              <button
                onClick={() => navigate(`/order-confirmation/${failedOrderId}`)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <span>📋</span>
                <span>View Order</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Debug info - remove this in production */}
      {/* {process.env.NODE_ENV === "development" && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">Debug Info:</h3>
          <div className="text-sm text-yellow-700">
            <p>Cart Items Count: {cartItems.length}</p>
            <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
            <p>Coupon Discount: ₹{couponDiscount.toFixed(2)}</p>
            <p>Final Total: ₹{total.toFixed(2)}</p>
            <p>Addresses Count: {addresses.length}</p>
            <p>Selected Address: {selectedAddress}</p>
            {appliedCoupon && (
              <p>
                Applied Coupon: {appliedCoupon.code} (-₹
                {appliedCoupon.discountAmount.toFixed(2)})
              </p>
            )}
            <details className="mt-2">
              <summary className="cursor-pointer">
                Debug Coupon Request Data
              </summary>
              <pre className="mt-2 text-xs overflow-x-auto bg-white p-2 rounded border">
                {JSON.stringify(
                  {
                    code: couponCode,
                    orderTotal: subtotal,
                    productIds: cartItems
                      .map((item) => item.product?._id || item.productId)
                      .filter((id) => id),
                    userId: user?._id,
                  },
                  null,
                  2
                )}
              </pre>
            </details>
            {cartItems.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer">Cart Items Details</summary>
                <pre className="mt-2 text-xs overflow-x-auto bg-white p-2 rounded border">
                  {JSON.stringify(cartItems.slice(0, 2), null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      )} */}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column - Order Details */}
        <div>
          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>

            {loading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading addresses...</span>
              </div>
            ) : addresses.length === 0 ? (
              <div>
                <p className="text-gray-600 mb-4">
                  No addresses found. Please add a shipping address.
                </p>
                <button
                  onClick={() => navigate("/profile/addresses")}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Add Address
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((address) => (
                  <label
                    key={address._id}
                    className="flex items-start space-x-3 p-3 border rounded cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name="address"
                      value={address._id}
                      checked={selectedAddress === address._id}
                      onChange={(e) => setSelectedAddress(e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium">
                        {address.label || address.fullName || address.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {address.line1 ||
                          address.street ||
                          address.addressLine1}
                        {address.line2 && `, ${address.line2}`}
                      </div>
                      <div className="text-sm text-gray-600">
                        {address.city}, {address.state}
                      </div>
                      <div className="text-sm text-gray-600">
                        {address.postalCode || address.zipCode} -{" "}
                        {address.country || "India"}
                      </div>
                      {address.phone && (
                        <div className="text-sm text-gray-600">
                          📱 {address.phone}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="flex items-center space-x-2">
                  <span>💵</span>
                  <div>
                    <div className="font-medium">Cash on Delivery</div>
                    <div className="text-sm text-gray-600">
                      Pay when you receive your order
                    </div>
                  </div>
                </div>
              </label>
              <label className="flex items-center space-x-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="ONLINE"
                  checked={paymentMethod === "ONLINE"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="flex items-center space-x-2">
                  <span>💳</span>
                  <div>
                    <div className="font-medium">Online Payment</div>
                    <div className="text-sm text-gray-600">
                      Credit/Debit Card, UPI, Net Banking
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Payment Method Info */}
          {paymentMethod === "ONLINE" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="text-blue-600 mt-0.5">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">
                    Online Payment Requirements
                  </h4>
                  <p className="text-sm text-blue-700">
                    For successful online payments, ensure your profile has an
                    Indian phone number (+91XXXXXXXXXX). International phone
                    numbers may cause payment failures.
                    {!user?.phone?.match(/^(\+91|91)?[6-9]\d{9}$/) && (
                      <span className="block mt-2 font-medium text-blue-800">
                        ⚠️ Your current phone number may not be compatible.
                        Consider updating it in your profile.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Order Summary */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            {/* Items */}
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {cartItems.map((item, index) => {
                const itemPrice =
                  item.variant?.price || item.product?.price || item.price || 0;
                const itemTotal = itemPrice * item.quantity;

                return (
                  <div
                    key={`${item.product?._id || item.productId}-${
                      item.variant?._id || item.variantId || "default"
                    }-${index}`}
                    className="flex justify-between items-start"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">
                        {item.product?.name || item.name}
                      </h3>
                      {(item.variant?.name || item.variantName) && (
                        <p className="text-sm text-gray-600">
                          {item.variant?.name || item.variantName}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-xs text-gray-500">
                        Price: ₹{itemPrice.toFixed(2)} each
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{itemTotal.toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Coupon Section */}
            <div className="border-t pt-4 mb-4">
              <h3 className="font-medium mb-3 flex items-center">
                <span className="mr-2">🎟️</span>
                Apply Coupon Code
              </h3>

              {!appliedCoupon ? (
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponError(""); // Clear error when typing
                        }}
                        placeholder="Enter coupon code (e.g. SAVE20)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm uppercase font-mono bg-gray-50 transition-all duration-200"
                        disabled={couponLoading}
                      />
                      {couponCode && (
                        <div className="absolute right-2 top-2">
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                            {couponCode.length}/10
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleValidateCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      {couponLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Validating...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <span>✨</span>
                          <span>Apply Coupon</span>
                        </div>
                      )}
                    </button>
                  </div>

                  {couponError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 animate-shake">
                      <div className="flex items-center space-x-2 text-red-700">
                        <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-xs">⚠️</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            Invalid Coupon Code
                          </p>
                          <p className="text-xs">{couponError}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Popular Coupons Hint */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                    <div className="text-xs text-blue-700 mb-2">
                      <span className="font-medium">
                        💡 Test Coupons (Development):
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setCouponCode("WELCOME10")}
                        className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                      >
                        WELCOME10
                      </button>
                      <button
                        onClick={() => setCouponCode("SAVE20")}
                        className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                      >
                        SAVE20
                      </button>
                      <button
                        onClick={() => setCouponCode("FIRST50")}
                        className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                      >
                        FIRST50
                      </button>
                      <button
                        onClick={() => setCouponCode("TEST10")}
                        className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full hover:bg-green-200 transition-colors"
                      >
                        TEST10
                      </button>
                    </div>
                    <div className="text-xs text-blue-600 mt-2">
                      If these don't work, you may need to create test coupons
                      in the admin panel first.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-lg">🎉</span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-bold text-green-800 text-lg">
                            {appliedCoupon.code}
                          </p>
                          <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                            APPLIED
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-green-700 font-semibold">
                            You saved ₹{appliedCoupon.discountAmount.toFixed(2)}
                            !
                          </p>
                          <span className="text-xs text-green-600">
                            (
                            {appliedCoupon.discountType === "percentage"
                              ? `${appliedCoupon.discountValue}% OFF`
                              : `₹${appliedCoupon.discountValue} OFF`}
                            )
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-red-200 hover:border-red-300"
                    >
                      <span className="flex items-center space-x-1">
                        <span>🗑️</span>
                        <span>Remove</span>
                      </span>
                    </button>
                  </div>

                  {/* Success Animation */}
                  <div className="mt-3 flex items-center space-x-2 text-green-600 text-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="font-medium">
                      Coupon discount applied to your order!
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>

              {appliedCoupon && couponDiscount > 0 && (
                <div className="flex justify-between items-center bg-green-50 -mx-6 px-6 py-2 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600 text-sm">🎟️</span>
                    <span className="text-green-700 font-medium">
                      Coupon ({appliedCoupon.code})
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-700 font-bold">
                      -₹{couponDiscount.toFixed(2)}
                    </span>
                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                      SAVED
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center font-bold text-xl border-t pt-3 bg-gradient-to-r from-blue-50 to-indigo-50 -mx-6 px-6 py-3 rounded-lg border border-blue-200">
                <span className="text-gray-800">Total Amount</span>
                <div className="text-right">
                  <span
                    className={
                      appliedCoupon ? "text-green-600" : "text-blue-600"
                    }
                  >
                    ₹{total.toFixed(2)}
                  </span>
                  {appliedCoupon && (
                    <div className="text-sm text-gray-500 font-normal">
                      <span className="line-through">
                        ₹{subtotal.toFixed(2)}
                      </span>
                      <span className="ml-2 text-green-600 font-medium">
                        You save ₹{couponDiscount.toFixed(2)}!
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handleCheckout}
              disabled={loading || paymentLoading || !selectedAddress}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg disabled:transform-none disabled:shadow-none ${
                appliedCoupon
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-green-200"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-200"
              } disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Order...</span>
                </div>
              ) : paymentLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Payment...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>{paymentMethod === "COD" ? "🚚" : "💳"}</span>
                  <div>
                    <div>
                      {paymentMethod === "COD"
                        ? "Place Order (Cash on Delivery)"
                        : "Place Order & Pay Online"}
                    </div>
                    {appliedCoupon && (
                      <div className="text-sm font-normal opacity-90">
                        With {appliedCoupon.code} • Save ₹
                        {couponDiscount.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </button>

            {/* Order Summary Footer */}
            {appliedCoupon && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 text-green-700">
                  <span>🎉</span>
                  <span className="text-sm font-medium">
                    Great choice! You're saving ₹{couponDiscount.toFixed(2)}{" "}
                    with coupon {appliedCoupon.code}
                  </span>
                </div>
              </div>
            )}

            {/* Payment Security Note */}
            {paymentMethod === "ONLINE" && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">🔒</span>
                  <span className="text-sm text-green-800">
                    Your payment information is secure and encrypted
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
