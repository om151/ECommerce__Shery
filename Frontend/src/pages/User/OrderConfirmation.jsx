import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getOrderById } from "../../shared/api/User/order.apiService.js";

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get order data from navigation state if available
  const { orderData, paymentId, paymentMethod } = location.state || {};

  useEffect(() => {
    if (orderId) {
      // Always fetch order details from API to get populated fields
      console.log(
        "📦 ORDER CONFIRMATION - Fetching order from API for ID:",
        orderId
      );
      fetchOrderDetails();
    } else {
      setError("No order information available");
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await getOrderById(orderId);
      console.log("📦 ORDER CONFIRMATION - Raw API response:", response);

      const orderData = response.order || response.data;
      console.log("📦 ORDER CONFIRMATION - Extracted order data:", orderData);
      console.log(
        "📦 ORDER CONFIRMATION - Order items structure:",
        orderData?.items
      );

      setOrder(orderData);
    } catch (error) {
      console.error(
        "📦 ORDER CONFIRMATION - Failed to fetch order details:",
        error
      );
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${Number(amount).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "processing":
        return "text-blue-600 bg-blue-100";
      case "shipped":
        return "text-purple-600 bg-purple-100";
      case "delivered":
        return "text-green-600 bg-green-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Order Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            The requested order could not be found.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-gray-600">
            Thank you for your purchase. Your order has been placed
            successfully.
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Order Details
              </h2>
              <p className="text-gray-600">
                Order #{order.orderNumber || orderId}
              </p>
              {order.createdAt && (
                <p className="text-sm text-gray-500">
                  Placed on {formatDate(order.createdAt)}
                </p>
              )}
            </div>
            <div className="mt-4 md:mt-0">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status || "Processing"}
              </span>
            </div>
          </div>

          {/* Payment Information - Show if available from navigation state */}
          {(paymentId || paymentMethod) && (
            <div className="border-t pt-4 mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Payment Information
              </h4>
              <div className="space-y-1">
                {paymentMethod && (
                  <p className="text-sm text-gray-600">
                    Payment Method:{" "}
                    <span className="font-medium">{paymentMethod}</span>
                  </p>
                )}
                {paymentId && (
                  <p className="text-sm text-gray-600">
                    Payment ID:{" "}
                    <span className="font-medium font-mono text-xs">
                      {paymentId}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Items Ordered
            </h3>
            {/* Debug: Show raw items data */}
            {process.env.NODE_ENV === "development" && (
              <details className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
                <summary className="cursor-pointer text-sm text-yellow-800">
                  Debug: Raw Order Items
                </summary>
                <pre className="mt-2 text-xs overflow-x-auto">
                  {JSON.stringify(order.items, null, 2)}
                </pre>
              </details>
            )}
            <div className="space-y-4">
              {order.items?.map((item, index) => {
                // Handle populated OrderItem structure
                console.log("📦 ITEM DEBUG - Raw item data:", item);

                // Extract data from populated OrderItem structure
                let quantity = Number(item.quantity) || 0;
                let unitPrice = Number(item.unitPrice) || 0;
                let subtotal = Number(item.subtotal) || quantity * unitPrice;
                let title = item.title || item.productId?.title || "Product";
                let variantName =
                  item.variantName || item.variantId?.name || "";

                // Fallback for direct product data (from navigation state)
                if (quantity === 0 && item.product) {
                  quantity = Number(item.quantity) || 1;
                  unitPrice = Number(
                    item.variant?.price ||
                      item.product?.price ||
                      item.price ||
                      0
                  );
                  subtotal = quantity * unitPrice;
                  title = item.product?.name || item.name || "Product";
                  variantName = item.variant?.name || item.variantName || "";
                }

                console.log("📦 ITEM DEBUG - Processed data:", {
                  index,
                  quantity,
                  unitPrice,
                  subtotal,
                  title,
                  variantName,
                });

                // Don't render items with 0 quantity
                if (quantity === 0) {
                  console.warn(
                    "📦 ITEM DEBUG - Skipping item with 0 quantity:",
                    item
                  );
                  return null;
                }

                return (
                  <div
                    key={item._id || `item-${index}`}
                    className="flex justify-between items-start border-b pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{title}</h4>
                      {variantName && (
                        <p className="text-sm text-gray-600">{variantName}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        Quantity:{" "}
                        <span className="font-medium">{quantity}</span> ×{" "}
                        {formatCurrency(unitPrice)}
                      </p>
                      {process.env.NODE_ENV === "development" && (
                        <p className="text-xs text-blue-500">
                          Debug: Q={quantity}, P={unitPrice}, S={subtotal}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(subtotal)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Totals */}
          <div className="border-t pt-4 mt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-900">
                  {formatCurrency(order.itemsSubtotal || order.subtotal || 0)}
                </span>
              </div>
              {order.orderDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount:</span>
                  <span className="text-green-600">
                    -{formatCurrency(order.orderDiscount)}
                  </span>
                </div>
              )}
              {order.shippingFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="text-gray-900">
                    {formatCurrency(order.shippingFee)}
                  </span>
                </div>
              )}
              {order.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span className="text-gray-900">
                    {formatCurrency(order.tax)}
                  </span>
                </div>
              )}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-gray-900">
                    {formatCurrency(order.grandTotal || order.total || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Payment Information
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="text-gray-900">
                {paymentMethod === "COD"
                  ? "Cash on Delivery"
                  : paymentMethod === "ONLINE"
                  ? "Online Payment"
                  : order.paymentMethod || "COD"}
              </span>
            </div>
            {paymentId && (
              <div className="flex justify-between">
                <span className="text-gray-600">Payment ID:</span>
                <span className="text-gray-900 font-mono text-sm">
                  {paymentId}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Status:</span>
              <span
                className={`font-medium ${
                  paymentMethod === "COD"
                    ? "text-yellow-600"
                    : paymentId
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              >
                {paymentMethod === "COD"
                  ? "Pay on Delivery"
                  : paymentId
                  ? "Paid"
                  : "Processing"}
              </span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Shipping Address
            </h3>
            <div className="text-gray-600">
              {typeof order.shippingAddress === "object" ? (
                <>
                  <p className="font-medium text-gray-900">
                    {order.shippingAddress.label}
                  </p>
                  <p>{order.shippingAddress.line1}</p>
                  {order.shippingAddress.line2 && (
                    <p>{order.shippingAddress.line2}</p>
                  )}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}
                  </p>
                  <p>
                    {order.shippingAddress.postalCode} -{" "}
                    {order.shippingAddress.country}
                  </p>
                </>
              ) : (
                <p className="text-gray-500">
                  Address details will be updated shortly
                </p>
              )}
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-blue-900 mb-3">
            What's Next?
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              You'll receive an email confirmation shortly with your order
              details.
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              We'll notify you when your order is shipped with tracking
              information.
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              You can track your order status in your account profile.
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/profile")}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            View Order History
          </button>
          <button
            onClick={() => navigate("/products")}
            className="bg-gray-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>

        {/* Support Information */}
        <div className="text-center mt-8 pt-8 border-t">
          <p className="text-gray-600 mb-2">Need help with your order?</p>
          <p className="text-sm text-gray-500">
            Contact our support team at{" "}
            <a
              href="mailto:support@example.com"
              className="text-blue-600 hover:underline"
            >
              support@example.com
            </a>{" "}
            or call us at{" "}
            <a href="tel:+1234567890" className="text-blue-600 hover:underline">
              +1 (234) 567-890
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
