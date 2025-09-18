import React from "react";
import { useAdmin } from "../../store/Hooks/Admin/useAdmin.js";

const OrdersTab = () => {
  const { orders, fetchOrders, ui } = useAdmin();
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    fetchOrders(currentPage, 10);
  }, [currentPage, fetchOrders]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Order Management
          </h2>
          <p className="text-gray-600">
            View and manage customer orders and fulfillment.
          </p>
        </div>
        <button
          onClick={() => fetchOrders(currentPage, 10)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {ui.errors.orders && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">
            <span className="font-medium">Error:</span> {ui.errors.orders}
          </p>
        </div>
      )}

      {ui.isLoading.orders ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((_, i) => (
            <div
              key={i}
              className="animate-pulse p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-48 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : orders.list?.length > 0 ? (
        <>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Orders ({orders.total})
                </h3>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {orders.list.map((order) => (
                <div key={order._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Order #{order.orderNumber}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.items?.length || 0} items •{" "}
                            {formatDate(order.createdAt)}
                          </p>
                          <p className="text-xs text-gray-400">
                            Customer:{" "}
                            {order.userId?.email ||
                              order.customerEmail ||
                              "Unknown"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(order.grandTotal || 0)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.currency || "INR"}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs rounded-full ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "shipped"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "processing"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status?.charAt(0).toUpperCase() +
                          order.status?.slice(1) || "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {orders.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {orders.totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, orders.totalPages))
                }
                disabled={currentPage === orders.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No orders found</p>
        </div>
      )}
    </div>
  );
};

export default OrdersTab;
