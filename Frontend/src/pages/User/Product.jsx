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
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

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

        // Fetch product details
        const productResponse = await getProductById(id);
        setProduct(productResponse.data.product);

        // Fetch product reviews
        const reviewsResponse = await getProductReviews(id);
        setReviews(reviewsResponse.data.reviews || []);
      } catch (error) {
        console.error("Error fetching product:", error);
        setError("Failed to load product details");
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
    if (!product) return;

    setAddingToCart(true);

    try {
      // Use the Redux action to add item
      await addToCart({ productId: product._id, quantity }); // Updated for Redux

      // Show success message (you can customize this)
      alert(`${product.name} added to cart!`);
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
      await addToCart({ productId: product._id, quantity });
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
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            The product you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                to="/"
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <svg
                  className="w-3 h-3 mr-2.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
                </svg>
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  className="w-3 h-3 text-gray-400 mx-1"
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
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                  {product.category}
                </span>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg
                  className="w-3 h-3 text-gray-400 mx-1"
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
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                  {product.name}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Product Details Grid */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Product Images */}
          <div className="flex flex-col-reverse">
            {/* Image thumbnails */}
            <div className="hidden mt-6 w-full max-w-2xl mx-auto sm:block lg:max-w-none">
              <div className="grid grid-cols-4 gap-6">
                {product.images?.map((image, index) => (
                  <button
                    key={index}
                    className={`relative h-24 bg-white rounded-md flex items-center justify-center text-sm font-medium uppercase text-gray-900 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring focus:ring-offset-4 focus:ring-opacity-50 ${
                      selectedImage === index ? "ring-2 ring-primary-500" : ""
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <span className="sr-only">Image {index + 1}</span>
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover object-center rounded-md"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Main image */}
            <div className="w-full aspect-w-1 aspect-h-1">
              <img
                src={
                  product.images?.[selectedImage] ||
                  product.image ||
                  "/api/placeholder/600/600"
                }
                alt={product.name}
                className="w-full h-full object-center object-cover sm:rounded-lg"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <h1 className="text-3xl font-bold font-heading tracking-tight text-gray-900">
              {product.name}
            </h1>

            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <p className="text-3xl tracking-tight text-gray-900">
                ${product.price}
              </p>
            </div>

            {/* Reviews */}
            <div className="mt-3">
              <h3 className="sr-only">Reviews</h3>
              <div className="flex items-center">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`${
                        i < Math.floor(averageRating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      } h-5 w-5 flex-shrink-0`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="ml-2 text-sm text-gray-500">
                  {averageRating.toFixed(1)} out of 5 stars ({reviews.length}{" "}
                  reviews)
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="sr-only">Description</h3>
              <div className="text-base text-gray-700 space-y-6">
                <p>{product.description}</p>
              </div>
            </div>

            {/* Stock Status */}
            <div className="mt-6">
              <div className="flex items-center">
                <svg
                  className={`w-5 h-5 mr-2 ${
                    product.stock > 0 ? "text-green-500" : "text-red-500"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span
                  className={`text-sm font-medium ${
                    product.stock > 0 ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {product.stock > 0
                    ? `In stock (${product.stock} available)`
                    : "Out of stock"}
                </span>
              </div>
            </div>

            {/* Add to Cart Section */}
            <div className="mt-8">
              <div className="flex items-center space-x-3">
                {/* Quantity Selector */}
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    type="button"
                    className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 min-w-[3rem] text-center border-x border-gray-300">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart Button */}
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleAddToCart}
                  loading={addingToCart}
                  disabled={product.stock === 0 || addingToCart}
                  className="flex-1"
                >
                  {addingToCart ? "Adding..." : "Add to Cart"}
                </Button>
              </div>

              {/* Buy Now Button */}
              <Button
                variant="secondary"
                size="lg"
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="w-full mt-4"
              >
                Buy Now
              </Button>
            </div>

            {/* Product Features */}
            {product.features && (
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900">Features</h3>
                <ul className="mt-4 space-y-2">
                  {product.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center text-sm text-gray-600"
                    >
                      <svg
                        className="w-4 h-4 text-green-500 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 lg:mt-24">
          <div className="border-t border-gray-200 pt-10">
            <h3 className="text-lg font-medium text-gray-900">
              Customer Reviews ({reviews.length})
            </h3>

            {/* Add Review Button */}
            {user && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowReviewForm(!showReviewForm)}
                >
                  Write a Review
                </Button>
              </div>
            )}

            {/* Review Form */}
            {showReviewForm && (
              <form
                onSubmit={handleReviewSubmit}
                className="mt-6 p-6 bg-gray-50 rounded-lg"
              >
                <div className="grid grid-cols-1 gap-6">
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
                          className={`${
                            i < reviewForm.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          } hover:text-yellow-400`}
                          onClick={() =>
                            setReviewForm((prev) => ({
                              ...prev,
                              rating: i + 1,
                            }))
                          }
                        >
                          <svg
                            className="w-5 h-5"
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
                      Review
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
                      className="input-base"
                      placeholder="Share your experience with this product..."
                      required
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex space-x-3">
                    <Button type="submit" variant="primary">
                      Submit Review
                    </Button>
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
            <div className="mt-8 space-y-8">
              {reviews.length === 0 ? (
                <p className="text-gray-600">
                  No reviews yet. Be the first to review this product!
                </p>
              ) : (
                reviews.map((review) => (
                  <div key={review._id} className="flex space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {review.user?.name?.charAt(0) || "U"}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          {review.user?.name || "Anonymous User"}
                        </h4>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`${
                                i < review.rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              } h-4 w-4`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <time className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </time>
                      </div>
                      <p className="mt-2 text-sm text-gray-700">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
