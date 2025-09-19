import React from "react";
import { useAdmin } from "../../../store/Hooks/Admin/useAdmin.js";
import ProductEditModal from "./productEditModel.jsx";

const ProductsTab = () => {
  const { products, fetchProducts, ui } = useAdmin();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const [showProductModal, setShowProductModal] = React.useState(false);

  React.useEffect(() => {
    fetchProducts(currentPage, 10);
  }, [currentPage, fetchProducts]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const closeProductModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Product Management
          </h2>
          <p className="text-gray-600">
            Add, edit, and manage your product catalog.
          </p>
        </div>
        <button
          onClick={() => fetchProducts(currentPage, 10)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {ui.errors.products && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">
            <span className="font-medium">Error:</span> {ui.errors.products}
          </p>
        </div>
      )}

      {ui.isLoading.products ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((_, index) => (
            <div
              key={index}
              className="animate-pulse p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : products.list?.length > 0 ? (
        <>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Products ({products.total})
                </h3>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {products.list.map((product) => (
                <div
                  key={product._id}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                      {product.variants?.[0]?.images?.[0] ? (
                        <img
                          src={product.variants[0].images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          📦
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {product.title || "Untitled Product"}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {product.description || "No description"}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs text-gray-400">
                          {product.categories?.join(", ") || "Uncategorized"}
                        </span>
                        <span className="text-xs text-gray-400">
                          {product.variants?.length || 0} variants
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {product.variants?.[0]?.price
                          ? formatCurrency(product.variants[0].price)
                          : "No price set"}
                      </p>
                      {/* <p className="text-xs text-gray-500">
                        ID: {product._id.slice(-8)}
                      </p> */}
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                          product.isDeleted
                            ? "bg-red-100 text-red-800"
                            : product.variants?.length > 0
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {product.isDeleted
                          ? "Deleted"
                          : product.variants?.length > 0
                          ? "Active"
                          : "No Variants"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {products.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-6">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {products.totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, products.totalPages)
                  )
                }
                disabled={currentPage === products.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found</p>
        </div>
      )}

      {/* Product Detail Modal */}
      {showProductModal && selectedProduct && (
        <ProductEditModal
          product={selectedProduct}
          onClose={closeProductModal}
          onSave={() => {
            // Refresh products after save
            fetchProducts(currentPage, 10);
            closeProductModal();
          }}
        />
      )}
    </div>
  );
};

export default ProductsTab;
