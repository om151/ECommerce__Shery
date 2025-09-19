import React, { useEffect, useState } from "react";
import { useAdmin } from "../../store/Hooks/Admin/useAdmin.js";

const OrdersTab = () => {
  // Note: allOrders lives under orders slice (orders.allOrders), not top-level
  const { orders, fetchOrders, ui, fetchAllOrders } = useAdmin();
  const [currentPage, setCurrentPage] = React.useState(1);

  const [showOrders, setShowOrders] = useState([]);

  const [searchOrder, setSearchOrder] = useState("");
  const [searchType, setSearchType] = useState("orderNumber");
  
  const allOrders = orders?.allOrders || [];

  const totalPage = Math.ceil(allOrders.length/10) || 1;

  // useEffect(() => {
  //   if (orders.list) {
  //     setShowOrders(orders.allOrders);
  //   }
  // }, [orders]);
  // const allOrders = fetchOrders();
  // console.log("All Orders:", allOrders);

  React.useEffect(() => {
    setShowOrders(allOrders.slice((currentPage-1)*10, currentPage*10));
  }, [currentPage,orders]);

  useEffect(() => {
    fetchAllOrders();
  }, []);

  // Access the full orders list from nested state
  

  const handleOrderSearch = (value) => {

    if(searchType==="orderNumber"){
      setSearchOrder(value);
            const filteredOrders = allOrders.filter((order) =>
              order.orderNumber
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase())
            );
             setShowOrders(filteredOrders);
    }else if(searchType==="customerEmail"){
      setSearchOrder(value);
      const filteredOrders = allOrders.filter((order) =>
        order.userId?.email.toLowerCase().includes(value.toLowerCase())
      );
      setShowOrders(filteredOrders);
    }

  }

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

      <div>
        <input
          type="text"
          value={searchOrder}
          onChange={(e) => {
            handleOrderSearch(e.target.value);
          }}
          placeholder={searchType === "orderNumber" ? "Search by order number" : "Search by customer email"}
          className="px-4 py-2 border border-gray-300 rounded-md mr-2 mb-4 w-full md:w-1/3"
        />
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md mb-4 w-full md:w-1/3"
        >
          <option value="orderNumber">Order Number</option>
          <option value="customerEmail" disabled >Customer Email</option>  
        </select>
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
      ) : showOrders?.length > 0 ? (
        <>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Orders ({searchOrder ? showOrders.length : allOrders.length})
                </h3>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {showOrders.map((order) => (
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

          {totalPage > 1 && !searchOrder && (
            <div className="flex justify-center items-center space-x-4 mt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPage}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPage))
                }
                disabled={currentPage === totalPage}
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
