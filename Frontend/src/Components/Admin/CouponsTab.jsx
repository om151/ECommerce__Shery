import { useEffect, useState } from "react";
import { useAdmin } from "../../store/Hooks/Admin/useAdmin.js";

const CouponsTab = () => {
  const { coupons, ui, fetchCoupons, clearCouponsError } = useAdmin();
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchCoupons(currentPage, 10);
  }, [fetchCoupons, currentPage]);

  const handleNextPage = () => {
    if (currentPage < coupons.totalPages) setCurrentPage((p) => p + 1);
  };
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };
  const handleCreateCoupon = () => setIsCreating(true);

  const formatDate = (d) => new Date(d).toLocaleDateString();
  const getDiscountDisplay = (c) =>
    c.discountType === "percentage"
      ? `${c.maxDiscount}%`
      : c.discountType === "fixed"
      ? `$${c.maxDiscount}`
      : c.discountType === "free_shipping"
      ? "Free Shipping"
      : "N/A";
  const getStatusBadge = (c) => {
    const now = new Date();
    const validFrom = new Date(c.validFrom);
    const validTo = new Date(c.validTo);
    if (!c.isActive)
      return (
        <span className="px-2 py-1 bg-gray-200 text-gray-800 rounded-full text-xs">
          Inactive
        </span>
      );
    if (now < validFrom)
      return (
        <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs">
          Scheduled
        </span>
      );
    if (now > validTo)
      return (
        <span className="px-2 py-1 bg-red-200 text-red-800 rounded-full text-xs">
          Expired
        </span>
      );
    return (
      <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs">
        Active
      </span>
    );
  };

  if (ui.isLoading.coupons && coupons.list.length === 0) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Coupon Management
          </h2>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-20 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Coupon Management
          </h2>
          <p className="text-gray-600 mt-1">
            Create and manage discount coupons and promotions
          </p>
        </div>
        <button
          onClick={handleCreateCoupon}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Create Coupon</span>
        </button>
      </div>

      {ui.errors.coupons && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
          <div className="flex justify-between items-center">
            <p>{ui.errors.coupons}</p>
            <button
              onClick={clearCouponsError}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {coupons.list.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-4xl mb-4">🎟️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Coupons Found
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by creating your first discount coupon.
            </p>
            <button
              onClick={handleCreateCoupon}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Create Your First Coupon
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code & Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valid Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {coupons.list.map((coupon) => (
                    <tr key={coupon._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {coupon.code}
                          </div>
                          <div className="text-sm text-gray-500">
                            {coupon.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getDiscountDisplay(coupon)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Min: ${coupon.minOrderValue || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {coupon.usageCount || 0} / {coupon.usageLimit || "∞"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{formatDate(coupon.validFrom)}</div>
                        <div className="text-gray-500">
                          to {formatDate(coupon.validTo)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(coupon)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            Edit
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {coupons.totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-700">
                    Showing page {currentPage} of {coupons.totalPages}(
                    {coupons.total} total coupons)
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === coupons.totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {ui.isLoading.coupons && coupons.list.length > 0 && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export default CouponsTab;
