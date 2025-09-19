import { useAdmin } from "../../store/Hooks/Admin/useAdmin.js";

const OverviewTab = () => {
  const { stats, orders, products, ui } = useAdmin();

  const formattedStats = [
    {
      title: "Total Users",
      value: stats.totalUsers?.toLocaleString() || "0",
      change: "+12%",
      color: "blue",
      loading: ui.isLoading.stats,
    },
    {
      title: "Total Orders",
      value: stats.totalOrders?.toLocaleString() || "0",
      change: "+8%",
      color: "green",
      loading: ui.isLoading.stats,
    },
    {
      title: "Total Products",
      value: stats.totalProducts?.toLocaleString() || "0",
      change: "+3%",
      color: "purple",
      loading: ui.isLoading.stats,
    },
    {
      title: "Revenue",
      value: `${stats.totalRevenue?.toLocaleString() || "0"}`,
      change: "+15%",
      color: "yellow",
      loading: ui.isLoading.stats,
    },
  ];

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
    });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Dashboard Overview
        </h2>
        <p className="text-gray-600">
          Here's what's happening with your store today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {formattedStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                {stat.loading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                )}
              </div>
              <div className="text-right">
                <span
                  className={`text-sm font-medium ${
                    stat.change.startsWith("+")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {ui.errors.stats && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">
            <span className="font-medium">Error loading stats:</span>{" "}
            {ui.errors.stats}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Orders
          </h3>
          {ui.isLoading.orders ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse p-3 border border-gray-200 rounded-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : orders.recentOrders?.length > 0 ? (
            <div className="space-y-3">
              {orders.recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
                >
                  <div>
                    <p className="font-medium">Order #{order.orderNumber}</p>
                    <p className="text-sm text-gray-600">
                      {order.items?.length || 0} items •{" "}
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(order.grandTotal || 0)}
                    </p>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "shipped"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "processing"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status?.charAt(0).toUpperCase() +
                        order.status?.slice(1) || "Pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No recent orders found</p>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Low Stock Products
          </h3>
          {ui.isLoading.products ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse p-3 border border-gray-200 rounded-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.lowStockProducts?.length > 0 ? (
            <div className="space-y-3">
              {products.lowStockProducts.map((product) => {
                // Find the lowest quantity among all variants
                const lowestQuantity = product.variants?.reduce((min, variant) => {
                  const qty = variant.inventoryId?.quantityAvailable ?? 0;
                  return min === null ? qty : Math.min(min, qty);
                }, null);

                return (
                  <div
                    key={product._id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
                  >
                    <div>
                      <p className="font-medium">
                        {product.title || "Unknown Product"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {product.categories?.[0] || "Uncategorized"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                        {lowestQuantity ?? 0} left
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">All products are well stocked</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
