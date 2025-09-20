import React from "react";
import { useAdmin } from "../../../store/Hooks/Admin/useAdmin.js";
import CreateProductModal from "./CreateProductModal.jsx";
import ProductEditModal from "./productEditModel.jsx";

const ProductsTab = () => {
  const { products, fetchProducts, ui, deleteProduct } = useAdmin();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const [showProductModal, setShowProductModal] = React.useState(false);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(null);

  // Filters
  const PAGE_SIZE = 10;
  const [searchTitle, setSearchTitle] = React.useState("");
  const [minPrice, setMinPrice] = React.useState("");
  const [maxPrice, setMaxPrice] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [brand, setBrand] = React.useState("all");

  // Fetch a larger page once and do client-side filtering + pagination
  React.useEffect(() => {
    fetchProducts(1, 1000);
  }, [fetchProducts]);

  const allProducts = products.list || [];

  // Derive category and brand options from data
  const categoryOptions = React.useMemo(() => {
    const set = new Set();
    allProducts.forEach((p) => (p.categories || []).forEach((c) => set.add(c)));
    return ["all", ...Array.from(set).sort()];
  }, [allProducts]);

  const brandOptions = React.useMemo(() => {
    const set = new Set();
    allProducts.forEach((p) => {
      const b = p.attributes?.brand;
      if (b) set.add(b);
    });
    return ["all", ...Array.from(set).sort()];
  }, [allProducts]);

  // Filtered products: title, price range across any variant, category, brand
  const filteredProducts = React.useMemo(() => {
    const term = (searchTitle || "").trim().toLowerCase();
    const hasMin = minPrice !== "" && !Number.isNaN(Number(minPrice));
    const hasMax = maxPrice !== "" && !Number.isNaN(Number(maxPrice));
    const min = hasMin ? Number(minPrice) : -Infinity;
    const max = hasMax ? Number(maxPrice) : Infinity;

    return allProducts.filter((p) => {
      // Title filter
      if (term && !(p.title || "").toLowerCase().includes(term)) return false;
      // Category filter
      if (category !== "all") {
        const cats = p.categories || [];
        if (!cats.includes(category)) return false;
      }
      // Brand filter
      if (brand !== "all") {
        if ((p.attributes?.brand || "") !== brand) return false;
      }
      // Price range filter: any variant within range qualifies the product
      const variants = p.variants || [];
      const matchesPrice = variants.some((v) => {
        const price = Number(v?.price);
        return Number.isFinite(price) && price >= min && price <= max;
      });
      if ((hasMin || hasMax) && !matchesPrice) return false;
      return true;
    });
  }, [allProducts, searchTitle, minPrice, maxPrice, category, brand]);

  // Reset to page 1 whenever filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTitle, minPrice, maxPrice, category, brand]);

  // Current page slice
  const pagedProducts = React.useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = currentPage * PAGE_SIZE;
    return filteredProducts.slice(start, end);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PAGE_SIZE)
  );

  // Scroll to top on page change
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

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
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchProducts(1, 1000)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            onClick={() => setShowCreateModal(true)}
          >
            Create Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 min-w-0">
          <input
            type="text"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            placeholder="Search by title"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            type="number"
            min="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min price"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            type="number"
            min="0"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max price"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All Categories" : c}
              </option>
            ))}
          </select>
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {brandOptions.map((b) => (
              <option key={b} value={b}>
                {b === "all" ? "All Brands" : b}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setSearchTitle("");
              setMinPrice("");
              setMaxPrice("");
              setCategory("all");
              setBrand("all");
            }}
            className="w-full px-3 py-2 border rounded-md hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Showing {filteredProducts.length} results
        </div>
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
      ) : filteredProducts.length > 0 ? (
        <>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Products ({filteredProducts.length})
                </h3>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {pagedProducts.map((product) => (
                <div
                  key={product._id}
                  className="p-6 hover:bg-gray-50 transition-colors"
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
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => handleProductClick(product)}
                    >
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
                      <div className="mt-2 flex items-center justify-end gap-2">
                        <button
                          className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                          onClick={() => handleProductClick(product)}
                        >
                          Edit
                        </button>
                        <button
                          disabled={isDeleting === product._id}
                          className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
                          onClick={async () => {
                            if (
                              !window.confirm(
                                "Delete this product? This will soft-delete it and its variants."
                              )
                            )
                              return;
                            setIsDeleting(product._id);
                            try {
                              await deleteProduct(product._id);
                              await fetchProducts(1, 1000);
                            } catch (e) {
                              console.error("Delete product failed", e);
                              alert(e.message || "Failed to delete product");
                            } finally {
                              setIsDeleting(null);
                            }
                          }}
                        >
                          {isDeleting === product._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Client-side Pagination for filtered results */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-6">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
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
            fetchProducts(1, 1000);
            closeProductModal();
          }}
        />
      )}

      {showCreateModal && (
        <CreateProductModal
          onClose={() => setShowCreateModal(false)}
          onCreated={async () => {
            await fetchProducts(1, 1000);
            setCurrentPage(1);
          }}
        />
      )}
    </div>
  );
};

export default ProductsTab;
