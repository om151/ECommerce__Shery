// Home Page - Main landing page with hero section and featured products
// This is the first page users see when they visit the site

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../shared/api/apiService.js';
import ProductCard from '../shared/components/ProductCard.jsx';
import LoadingSpinner from '../shared/components/LoadingSpinner.jsx';
import Button from '../shared/components/Button.jsx';

/**
 * Home page component with hero section and featured products
 * @returns {React.Component} Home page component
 */
const Home = () => {
  // State for featured products
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load featured products when component mounts
  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  /**
   * Load featured products from API
   * In a real app, you might have a specific endpoint for featured products
   */
  const loadFeaturedProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get all products and take first 8 as featured
      const response = await getProducts();
      const products = response.products || [];
      
      // Take first 8 products as featured (you could add featured flag to backend)
      setFeaturedProducts(products.slice(0, 8));

    } catch (error) {
      console.error('Error loading featured products:', error);
      setError('Failed to load featured products');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Hero Content */}
            <div>
              <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6">
                Welcome to{' '}
                <span className="text-yellow-400">E-Store</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-primary-100">
                Discover amazing products at unbeatable prices.
                Shop with confidence and enjoy fast, free shipping.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/products">
                  <Button size="lg" className="bg-white text-[#2563eb] hover:bg-gray-400">
                    Shop Now
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary-600">
                  Learn More
                </Button>
              </div>
            </div>

            {/* Hero Image/Graphic */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md">
                {/* Placeholder for hero image - you can replace with actual image */}
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 text-center">
                  <svg className="w-32 h-32 mx-auto mb-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <h3 className="text-xl font-semibold mb-2">Quality Products</h3>
                  <p className="text-primary-100">Curated selection of the best items</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 - Free Shipping */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Free Shipping</h3>
              <p className="text-gray-600">Free shipping on all orders above ₹500</p>
            </div>

            {/* Feature 2 - 24/7 Support */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600">Round the clock customer support</p>
            </div>

            {/* Feature 3 - Money Back */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Money Back Guarantee</h3>
              <p className="text-gray-600">100% money back guarantee within 30 days</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our handpicked selection of trending products at amazing prices
            </p>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            // Loading state
            <div className="flex justify-center">
              <LoadingSpinner size="lg" text="Loading featured products..." />
            </div>
          ) : error ? (
            // Error state
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadFeaturedProducts}>
                Try Again
              </Button>
            </div>
          ) : featuredProducts.length > 0 ? (
            // Products grid
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard 
                    key={product._id} 
                    product={product}
                    className="hover:shadow-xl transition-shadow duration-300"
                  />
                ))}
              </div>

              {/* View All Products Button */}
              <div className="text-center mt-12">
                <Link to="/products">
                  <Button size="lg" variant="outline">
                    View All Products
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            // Empty state
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No featured products available</p>
              <Link to="/products">
                <Button>Browse All Products</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Subscribe to our newsletter and get 10% off your first order
          </p>
          
          {/* Newsletter Form */}
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
              required
            />
            <Button 
              type="submit"
              size="lg" 
              className="bg-white text-primary-600 hover:bg-gray-100 px-8"
            >
              Subscribe
            </Button>
          </form>
          
          <p className="text-sm text-primary-200 mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;