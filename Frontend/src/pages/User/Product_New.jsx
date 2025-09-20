// Product Detail Page - Individual product view with add to cart
// This page displays detailed information about a single product

import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../../Components/Common/Button.jsx";
import LoadingSpinner from "../../Components/Common/LoadingSpinner.jsx";
import { getProductById } from "../../shared/api/User/getProduct.apiService.js";
import { getProductReviews } from "../../shared/api/User/review.apiService.js";
import { useAuth } from "../../store/Hooks/Common/hook.useAuth.js";
import { useCart } from "../../store/Hooks/User/hook.useCart.js";

/**
 * Product detail page component
 * @returns {React.Component} Product detail page component
 */
const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  // Product data state
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Product interaction states
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  // Review state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });

  /**
   * Fetch product data and reviews
   */
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch product details
        const productResponse = await getProductById(id);

        if (productResponse.success && productResponse.product) {
          setProduct(productResponse.product);
          // Set default variant (first variant)
          if (
            productResponse.product.variants &&
            productResponse.product.variants.length > 0
          ) {
            setSelectedVariant(productResponse.product.variants[0]);
          }
        } else {
          setError("Product not found");
          return;
        }

        // Fetch product reviews
        try {
          const reviewsResponse = await getProductReviews(id);
          setReviews(reviewsResponse.data.reviews || []);
        } catch (reviewError) {
          console.log("Reviews not available for this product");
          setReviews([]);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        if (error.response?.status === 404) {
          setError("Product not found");
        } else {
          setError("Failed to load product details");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductData();
    }
  }, [id]);

  /**
   * Handle add to cart
   */
  const handleAddToCart = async () => {
    if (!product || !selectedVariant) return;

    setAddingToCart(true);

    try {
      // Use the Redux action to add item with variant
      await addToCart({
        productId: product._id,
        variantId: selectedVariant._id,
        quantity,
      });

      // Show success message (you can customize this)
      alert(`${product.title} added to cart!`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add product to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  /**
   * Handle buy now
   */
  const handleBuyNow = async () => {
    if (!user) {
      navigate("/login", { state: { from: `/product/${id}` } });
      return;
    }

    // Add to cart first
    try {
      await addToCart({
        productId: product._id,
        variantId: selectedVariant._id,
        quantity,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add product to cart");
      return;
    }

    // Navigate to checkout
    navigate("/checkout");
  };

  /**
   * Handle review submission
   */
  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate("/login", { state: { from: `/product/${id}` } });
      return;
    }

    try {
      // Submit review (API placeholder)
      console.log("Submitting review:", reviewForm);

      // Reset form
      setReviewForm({ rating: 5, comment: "" });
      setShowReviewForm(false);

      // You would typically refetch reviews here
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {error ||
              "The product you're looking for doesn't exist or has been removed."}
          </p>
          <div className="space-x-4">
            <Button onClick={() => navigate(-1)} variant="outline">
              Go Back
            </Button>
            <Button onClick={() => navigate("/products")}>
              Browse Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Navigation Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav
            className="flex items-center justify-between py-4"
            aria-label="Breadcrumb"
          >
            {/* Breadcrumb */}
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-1.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  Home
                </Link>
              </li>
              <li className="flex items-center">
                <svg
                  className="w-4 h-4 text-gray-300 mx-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <Link
                  to="/products"
                  className="text-gray-500 hover:text-indigo-600 transition-colors"
                >
                  Products
                </Link>
              </li>
              <li className="flex items-center">
                <svg
                  className="w-4 h-4 text-gray-300 mx-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-900 font-medium truncate max-w-[200px]">
                  {product.title}
                </span>
              </li>
            </ol>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                  />
                </svg>
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Grid */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start">
          {/* Image Gallery - 7 columns */}
          <div className="lg:col-span-7">
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square w-full max-w-2xl mx-auto">
                <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden group">
                  <img
                    src={
                      selectedVariant?.images?.[selectedImage] ||
                      selectedVariant?.images?.[0] ||
                      "/api/placeholder/800/800"
                    }
                    alt={product.title}
                    className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Image Navigation */}
                  {selectedVariant?.images &&
                    selectedVariant.images.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setSelectedImage(
                              selectedImage > 0
                                ? selectedImage - 1
                                : selectedVariant.images.length - 1
                            )
                          }
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() =>
                            setSelectedImage(
                              selectedImage < selectedVariant.images.length - 1
                                ? selectedImage + 1
                                : 0
                            )
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </>
                    )}
                </div>
              </div>

              {/* Thumbnail Images */}
              {selectedVariant?.images && selectedVariant.images.length > 1 && (
                <div className="flex space-x-2 justify-center">
                  {selectedVariant.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? "border-indigo-500 ring-2 ring-indigo-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Info - 5 columns */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {/* Product Title & Brand */}
              <div className="mb-6">
                {product.attributes?.brand && (
                  <p className="text-sm font-medium text-indigo-600 mb-2">
                    {product.attributes.brand}
                  </p>
                )}
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                  {product.title}
                </h1>
              </div>

              {/* Reviews */}
              <div className="flex items-center mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(averageRating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-3 text-sm text-gray-600">
                  {averageRating > 0 ? averageRating.toFixed(1) : "No reviews"}{" "}
                  ({reviews.length} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-bold text-gray-900">
                    ${selectedVariant?.price || 0}
                  </span>
                  {selectedVariant?.compareAtPrice &&
                    selectedVariant.compareAtPrice > selectedVariant.price && (
                      <span className="text-lg text-gray-500 line-through">
                        ${selectedVariant.compareAtPrice}
                      </span>
                    )}
                </div>
              </div>

              {/* Variant Selection */}
              {product.variants && product.variants.length > 1 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Options
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {product.variants.map((variant, index) => (
                      <button
                        key={variant._id}
                        onClick={() => {
                          setSelectedVariant(variant);
                          setSelectedImage(0);
                        }}
                        className={`p-4 border rounded-xl text-left transition-all ${
                          selectedVariant?._id === variant._id
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">
                              {variant.name || `Option ${index + 1}`}
                            </div>
                            {(variant.attributes?.color ||
                              variant.attributes?.size) && (
                              <div className="text-sm text-gray-500 mt-1">
                                {variant.attributes.color &&
                                  variant.attributes.color}
                                {variant.attributes.color &&
                                  variant.attributes.size &&
                                  " • "}
                                {variant.attributes.size &&
                                  variant.attributes.size}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">
                              ${variant.price}
                            </div>
                            <div
                              className={`text-sm ${
                                variant.inventoryId?.quantityAvailable > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {variant.inventoryId?.quantityAvailable > 0
                                ? `${variant.inventoryId.quantityAvailable} in stock`
                                : "Out of stock"}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="border-t pt-6">
                {/* Quantity Selector */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-900">
                    Quantity
                  </span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 12H4"
                        />
                      </svg>
                    </button>
                    <span className="px-4 py-2 min-w-[3rem] text-center font-medium">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(
                          Math.min(
                            selectedVariant?.inventoryId?.quantityAvailable ||
                              0,
                            quantity + 1
                          )
                        )
                      }
                      disabled={
                        quantity >=
                        (selectedVariant?.inventoryId?.quantityAvailable || 0)
                      }
                      className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    size="lg"
                    onClick={handleAddToCart}
                    loading={addingToCart}
                    disabled={
                      !selectedVariant ||
                      selectedVariant?.inventoryId?.quantityAvailable === 0 ||
                      addingToCart
                    }
                    className="w-full text-lg py-4"
                  >
                    {addingToCart ? "Adding to Cart..." : "Add to Cart"}
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleBuyNow}
                    disabled={
                      !selectedVariant ||
                      selectedVariant?.inventoryId?.quantityAvailable === 0
                    }
                    className="w-full text-lg py-4"
                  >
                    Buy Now
                  </Button>
                </div>
              </div>

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Key Features
                  </h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {[
                  { id: "description", label: "Description" },
                  { id: "reviews", label: `Reviews (${reviews.length})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "description" && (
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {product.description}
                  </p>
                  {product.categories && product.categories.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Categories
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {product.categories.map((category, index) => (
                          <span
                            key={index}
                            className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "reviews" && (
                <div>
                  {/* Add Review Button */}
                  {user && !showReviewForm && (
                    <div className="mb-6">
                      <Button
                        variant="outline"
                        onClick={() => setShowReviewForm(true)}
                      >
                        Write a Review
                      </Button>
                    </div>
                  )}

                  {/* Review Form */}
                  {showReviewForm && (
                    <form
                      onSubmit={handleReviewSubmit}
                      className="mb-8 p-6 bg-gray-50 rounded-xl"
                    >
                      <h4 className="font-semibold text-gray-900 mb-4">
                        Write Your Review
                      </h4>
                      <div className="space-y-4">
                        {/* Rating */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rating
                          </label>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() =>
                                  setReviewForm((prev) => ({
                                    ...prev,
                                    rating: i + 1,
                                  }))
                                }
                                className={`p-1 transition-colors ${
                                  i < reviewForm.rating
                                    ? "text-yellow-400 hover:text-yellow-500"
                                    : "text-gray-300 hover:text-gray-400"
                                }`}
                              >
                                <svg
                                  className="w-6 h-6"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Comment */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Review
                          </label>
                          <textarea
                            rows={4}
                            value={reviewForm.comment}
                            onChange={(e) =>
                              setReviewForm((prev) => ({
                                ...prev,
                                comment: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Share your experience with this product..."
                            required
                          />
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex space-x-3">
                          <Button type="submit">Submit Review</Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowReviewForm(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Reviews List */}
                  <div className="space-y-6">
                    {reviews.length === 0 ? (
                      <div className="text-center py-12">
                        <svg
                          className="w-12 h-12 text-gray-400 mx-auto mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8m0 0V6a2 2 0 012-2h10a2 2 0 012 2v2"
                          />
                        </svg>
                        <p className="text-gray-600 text-lg">No reviews yet</p>
                        <p className="text-gray-500">
                          Be the first to review this product!
                        </p>
                      </div>
                    ) : (
                      reviews.map((review) => (
                        <div
                          key={review._id}
                          className="border-b border-gray-200 pb-6 last:border-b-0"
                        >
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {review.user?.name?.charAt(0)?.toUpperCase() ||
                                "U"}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h5 className="font-semibold text-gray-900">
                                    {review.user?.name || "Anonymous User"}
                                  </h5>
                                  <div className="flex items-center mt-1">
                                    {[...Array(5)].map((_, i) => (
                                      <svg
                                        key={i}
                                        className={`w-4 h-4 ${
                                          i < review.rating
                                            ? "text-yellow-400"
                                            : "text-gray-300"
                                        }`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    ))}
                                  </div>
                                </div>
                                <time className="text-sm text-gray-500">
                                  {new Date(
                                    review.createdAt
                                  ).toLocaleDateString()}
                                </time>
                              </div>
                              <p className="text-gray-700 leading-relaxed">
                                {review.comment}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
