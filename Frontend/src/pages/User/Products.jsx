// Products Listing Page - Browse all products with filters and search
// This page displays a grid of products with filtering and search capabilities

import React, { useEffect, useState } from "react";
import Button from "../../Components/Common/Button.jsx";
import LoadingSpinner from "../../Components/Common/LoadingSpinner.jsx";
import ProductCard from "../../Components/User/ProductCardUpdated.jsx";
import { useProducts } from "../../store/Hooks/User/hook.useProducts.js";

/**
 * Products listing page component
 * @returns {React.Component} Products listing page component
 */
const Products = () => {
  const {
    products,
    loading,
    filtersLoading,
    error,
    hasNextPage,
    totalProducts,
    currentPage,
    totalPages,
    availableFilters,
    filters,
    showFilters,
    viewMode,
    fetchProducts,
    fetchFilters,
    loadMore,
    applyFilter,
    applyMultipleFilters,
    clearFilters,
    searchProducts,
    toggleFiltersSidebar,
    changeViewMode,
  } = useProducts();

  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  // Initialize data on component mount
  useEffect(() => {
    fetchFilters();
    fetchProducts();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [filters]);

  // Handle search input
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    searchProducts(searchTerm);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    // Handle inStock filter specially - when unchecked, send empty string
    if (key === "inStock" && value === false) {
      applyFilter(key, "");
    } else {
      applyFilter(key, value);
    }
  };

  // Handle price range filter
  const handlePriceRangeSubmit = () => {
    applyMultipleFilters({
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
    });
  };

  // Handle sort change
  const handleSortChange = (e) => {
    const [sortBy, sortOrder] = e.target.value.split("-");
    applyMultipleFilters({ sortBy, sortOrder });
  };

  // Clear all filters
  const handleClearFilters = () => {
    clearFilters();
    setSearchTerm("");
    setPriceRange({ min: "", max: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
            <p className="mt-2 text-gray-600">
              {loading ? "Loading..." : `${totalProducts} products found`}
            </p>
          </div>

          {/* Search and Controls Bar */}
          <div className="pb-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg
                      className="h-5 w-5 text-gray-400 hover:text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5-5 5M6 12h12"
                      />
                    </svg>
                  </button>
                </div>
              </form>

              {/* Controls */}
              <div className="flex items-center gap-4">
                {/* View Mode Toggle */}
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => changeViewMode("grid")}
                    className={`p-2 ${
                      viewMode === "grid"
                        ? "bg-indigo-100 text-indigo-600"
                        : "text-gray-400"
                    }`}
                    title="Grid view"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => changeViewMode("list")}
                    className={`p-2 ${
                      viewMode === "list"
                        ? "bg-indigo-100 text-indigo-600"
                        : "text-gray-400"
                    }`}
                    title="List view"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>

                {/* Sort Dropdown */}
                <select
                  onChange={handleSortChange}
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="title-asc">Name: A to Z</option>
                  <option value="title-desc">Name: Z to A</option>
                </select>

                {/* Filter Toggle */}
                <Button
                  onClick={toggleFiltersSidebar}
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                >
                  <svg
                    className="h-5 w-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"
                    />
                  </svg>
                  Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div
            className={`${
              showFilters ? "block" : "hidden"
            } lg:block w-80 flex-shrink-0`}
          >
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <Button
                  onClick={handleClearFilters}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  Clear All
                </Button>
              </div>

              <div className="space-y-6">
                {/* Category Filter */}
                {availableFilters.categories.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Category</h4>
                    <div className="space-y-2">
                      {availableFilters.categories.map((category) => (
                        <label key={category} className="flex items-center">
                          <input
                            type="radio"
                            name="category"
                            value={category}
                            checked={filters.category === category}
                            onChange={(e) =>
                              handleFilterChange("category", e.target.value)
                            }
                            className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                          />
                          <span className="ml-3 text-sm text-gray-700">
                            {category}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Brand Filter */}
                {availableFilters.brands.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Brand</h4>
                    <div className="space-y-2">
                      {availableFilters.brands.map((brand) => (
                        <label key={brand} className="flex items-center">
                          <input
                            type="radio"
                            name="brand"
                            value={brand}
                            checked={filters.brand === brand}
                            onChange={(e) =>
                              handleFilterChange("brand", e.target.value)
                            }
                            className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                          />
                          <span className="ml-3 text-sm text-gray-700">
                            {brand}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Range */}
                {availableFilters.priceRange.max > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Price Range
                    </h4>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) =>
                          setPriceRange({ ...priceRange, min: e.target.value })
                        }
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <span className="text-gray-400">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) =>
                          setPriceRange({ ...priceRange, max: e.target.value })
                        }
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <Button
                        onClick={handlePriceRangeSubmit}
                        size="sm"
                        variant="outline"
                      >
                        Apply
                      </Button>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Range: ₹{availableFilters.priceRange.min} - ₹
                      {availableFilters.priceRange.max}
                    </div>
                  </div>
                )}

                {/* Color Filter */}
                {/* {availableFilters.colors.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Color</h4>
                    <div className="flex flex-wrap gap-2">
                      {availableFilters.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() =>
                            handleFilterChange(
                              "color",
                              filters.color === color ? "" : color
                            )
                          }
                          className={`px-3 py-1 text-xs rounded-full border ${
                            filters.color === color
                              ? "bg-indigo-100 border-indigo-500 text-indigo-700"
                              : "border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )} */}

                {/* Size Filter */}
                {availableFilters.sizes.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Size</h4>
                    <div className="flex flex-wrap gap-2">
                      {availableFilters.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() =>
                            handleFilterChange(
                              "size",
                              filters.size === size ? "" : size
                            )
                          }
                          className={`px-3 py-1 text-xs rounded-full border ${
                            filters.size === size
                              ? "bg-indigo-100 border-indigo-500 text-indigo-700"
                              : "border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock Status */}
                {/* <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Availability
                  </h4>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.inStock === true}
                      onChange={(e) =>
                        handleFilterChange("inStock", e.target.checked)
                      }
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      In Stock Only
                    </span>
                  </label>
                </div> */}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {loading && products.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner />
              </div>
            ) : (
              <>
                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v4.01"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No products found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Try adjusting your search or filter criteria.
                    </p>
                    <div className="mt-6">
                      <Button onClick={handleClearFilters} variant="outline">
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Products Grid */}
                    <div
                      className={
                        viewMode === "grid"
                          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                          : "space-y-4"
                      }
                    >
                      {products.map((product) => (
                        <ProductCard
                          key={product._id}
                          product={product}
                          viewMode={viewMode}
                        />
                      ))}
                    </div>

                    {/* Load More Button */}
                    {hasNextPage && (
                      <div className="mt-8 text-center">
                        <Button
                          onClick={loadMore}
                          disabled={loading}
                          variant="outline"
                          size="lg"
                        >
                          {loading ? (
                            <>
                              <LoadingSpinner className="mr-2" />
                              Loading...
                            </>
                          ) : (
                            "Load More Products"
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Pagination Info */}
                    <div className="mt-6 text-center text-sm text-gray-500">
                      Showing {products.length} of {totalProducts} products
                      {totalPages > 1 && (
                        <span className="ml-2">
                          (Page {currentPage} of {totalPages})
                        </span>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
