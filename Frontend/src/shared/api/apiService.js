// API service functions for making HTTP requests to backend endpoints
// This file contains all API calls organized by feature/resource

import httpClient from "./http.js";

// =============================================================================
// AUTHENTICATION API CALLS
// =============================================================================

/**
 * Login user with email and password
 * @param {Object} credentia/**
 * Get shipping price calculation
 * @param {Object} shippingData - Shipping calculation data
 * @param {string} shippingData.pincode - Delivery pincode
 * @param {number} shippingData.weight - Package weight
 * @returns {Promise} API response with shipping price
 */
// export const getShippingPrice = async (shippingData) => {
//   try {
//     const response = await httpClient.get("/address/shipping-price", {
//       params: shippingData,
//     });
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// =============================================================================
// ADMIN API CALLS
// =============================================================================

/**
 * Get all users (Admin only)
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of users per page
 * @returns {Promise} API response with users list
 */
// export const getAllUsers = async (page = 1, limit = 10) => {
//   try {
//     const response = await httpClient.get("/user/admin/all", {
//       params: { page, limit },
//     });
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

/**
 * Get all orders (Admin only)
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of orders per page
 * @returns {Promise} API response with orders list
 */
// export const getAllOrders = async (page = 1, limit = 10) => {
//   try {
//     const response = await httpClient.get("/order/admin/all", {
//       params: { page, limit },
//     });
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

/**
 * Get all products (Admin only)
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of products per page
 * @returns {Promise} API response with products list
 */
// export const getAllProducts = async (page = 1, limit = 10) => {
//   try {
//     const response = await httpClient.get("/product", {
//       params: { page, limit },
//     });
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

/**
 * Update a product (Admin only)
 * @param {string} productId - Product ID to update
 * @param {Object} productData - Updated product data
 * @returns {Promise} API response with updated product
 */
// export const updateProduct = async (productId, productData) => {
//   try {
//     const response = await httpClient.put(`/product/edit/${productId}`, productData);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

/**
 * Get all coupons (Admin only)
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of coupons per page
 * @returns {Promise} API response with coupons list
 */
// export const getAllCoupons = async (page = 1, limit = 10) => {
//   try {
//     const response = await httpClient.get("/coupon", {
//       params: { page, limit },
//     });
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

/**
 * Get admin dashboard statistics
 * @returns {Promise} API response with dashboard stats
 */
// export const getAdminStats = async () => {
//   try {
//     // Since there might not be a dedicated stats endpoint,
//     // we'll fetch basic counts from existing endpoints
//     const [usersResponse, ordersResponse, productsResponse] = await Promise.all(
//       [
//         httpClient.get("/user/admin/all", { params: { page: 1, limit: 1 } }),
//         httpClient.get("/order/admin/all", { params: { page: 1, limit: 1 } }),
//         httpClient.get("/product", { params: { page: 1, limit: 1 } }),
//       ]
//     );

//     // console.log("Admin Stats Responses:");
//     // console.log(usersResponse.data);
//     // console.log(ordersResponse.data);
//     // console.log(productsResponse.data);

//     return {
//       totalUsers:
//         usersResponse.data.totalCount || usersResponse.data.count || 0,
//       totalOrders:
//         ordersResponse.data.totalCount || ordersResponse.data.count || ordersResponse.data.total || 0,
//       totalProducts:
//         productsResponse.data.totalCount || productsResponse.data.count || productsResponse.data.total || 0,
//     };
//   } catch (error) {
//     throw error;
//   }
// };

/**
 * Get low stock products (Admin only)
 * @param {number} threshold - Stock threshold (default: 5)
 * @returns {Promise} API response with low stock products
 */
// export const getLowStockProducts = async (threshold = 5) => {
//   try {
//     const response = await httpClient.get("/product", {
//       params: { lowStock: threshold },
//     });
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

/**
 * Get recent orders (Admin only)
 * @param {number} limit - Number of recent orders to fetch
 * @returns {Promise} API response with recent orders
 */
// export const getRecentOrders = async (limit = 10) => {
//   try {
//     const response = await httpClient.get("/order/admin/all", {
//       params: { page: 1, limit, sort: "createdAt", order: "desc" },
//     });
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };
// export const loginUser = async (credentials) => {
//   try {
//     const response = await httpClient.post("/user/login", credentials);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

/**
 * Register new user account
 * @param {Object} userData - User registration data
 * @param {string} userData.name - User's full name
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @param {string} userData.phone - User phone number
 * @returns {Promise} API response with user data
 */
// export const registerUser = async (userData) => {
//   try {
//     const response = await httpClient.post("/user/register", userData);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// /**
//  * Get current user profile
//  * @returns {Promise} API response with user profile data
//  */
// export const getUserProfile = async () => {
//   try {
//     const response = await httpClient.get("/user/profile");
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// /**
//  * Initiate forgot password process
//  * @param {Object} data - Email data
//  * @param {string} data.email - User email address
//  * @returns {Promise} API response with reset link info
//  */
// export const forgotPassword = async (data) => {
//   try {
//     const response = await httpClient.post("/user/forgot-password", data);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// /**
//  * Reset password using token
//  * @param {string} token - Reset token from email
//  * @param {Object} data - New password data
//  * @param {string} data.newPassword - New password
//  * @returns {Promise} API response with success message
//  */
// export const resetPassword = async (token, data) => {
//   try {
//     const response = await httpClient.post(
//       `/user/reset-password?token=${token}`,
//       data
//     );
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// /**
//  * Update user profile
//  * @param {Object} profileData - Profile update data
//  * @returns {Promise} API response with updated user data
//  */
// export const updateUserProfile = async (profileData) => {
//   try {
//     const response = await httpClient.put("/user/edit", profileData);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

/**
 * Get user addresses
 * @returns {Promise} API response with addresses array
 */
// export const getUserAddresses = async () => {
//   try {
//     const response = await httpClient.get("/address");
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

/**
 * Apply coupon code
 * @param {string} couponCode - Coupon code to apply
 * @param {number} orderTotal - Order total amount
 * @returns {Promise} API response with discount information
 */
// export const applyCoupon = async (couponCode, orderTotal) => {
//   try {
//     const response = await httpClient.post("/coupon/apply", {
//       couponCode,
//       orderTotal,
//     });
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

/**
 * Get product reviews
 * @param {string} productId - Product ID
 * @returns {Promise} API response with reviews array
 */
// export const getProductReviews = async (productId) => {
//   try {
//     const response = await httpClient.get(`/review/${productId}`);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

/**
 * Get featured products for homepage
 * @returns {Promise} API response with featured products
 */
// export const getFeaturedProducts = async () => {
//   try {
//     const response = await httpClient.get("/product/featured");
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

/**
 * Logout current user
 * @returns {Promise} API response
 */
// export const logoutUser = async () => {
//   try {
//     const response = await httpClient.post("/user/logout");
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// =============================================================================
// PRODUCTS API CALLS
// =============================================================================

/**
 * Get all products from the store
 * @returns {Promise} API response with products array
 */
// export const getProducts = async () => {
//   try {
//     const response = await httpClient.get("/product");
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// /**
//  * Get single product by ID
//  * @param {string} productId - Product ID to fetch
//  * @returns {Promise} API response with product data
//  */
// export const getProductById = async (productId) => {
//   try {
//     const response = await httpClient.get(`/product/${productId}`);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// =============================================================================
// CART API CALLS
// =============================================================================

/**
 * Get user's cart items
 * @returns {Promise} API response with cart data
 */
// export const getCart = async () => {
//   try {
//     const response = await httpClient.get("/cart");
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// /**
//  * Add item to cart
//  * @param {Object} cartItem - Item to add to cart
//  * @param {string} cartItem.productId - Product ID
//  * @param {string} cartItem.variantId - Product variant ID
//  * @param {number} cartItem.quantity - Quantity to add
//  * @returns {Promise} API response with updated cart
//  */
// export const addToCart = async (cartItem) => {
//   try {
//     const response = await httpClient.post("/cart/add", cartItem);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// /**
//  * Update cart item quantity
//  * @param {Object} updateData - Cart update data
//  * @param {string} updateData.productId - Product ID
//  * @param {string} updateData.variantId - Product variant ID
//  * @param {number} updateData.quantity - New quantity
//  * @returns {Promise} API response with updated cart
//  */
// export const updateCartItem = async (updateData) => {
//   try {
//     const response = await httpClient.put("/cart/update", updateData);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// /**
//  * Remove item from cart
//  * @param {Object} removeData - Item removal data
//  * @param {string} removeData.productId - Product ID
//  * @param {string} removeData.variantId - Product variant ID
//  * @returns {Promise} API response with updated cart
//  */
// export const removeFromCart = async (removeData) => {
//   try {
//     const response = await httpClient.post("/cart/remove", removeData);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// =============================================================================
// WISHLIST API CALLS
// =============================================================================

/**
 * Get user's wishlist
 * @returns {Promise} API response with wishlist data
 */
// export const getWishlist = async () => {
//   try {
//     const response = await httpClient.get("/wishlist");
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// /**
//  * Add product to wishlist
//  * @param {Object} wishlistData - Wishlist item data
//  * @param {string} wishlistData.productId - Product ID to add
//  * @returns {Promise} API response with updated wishlist
//  */
// export const addToWishlist = async (wishlistData) => {
//   try {
//     const response = await httpClient.post("/wishlist/add", wishlistData);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// /**
//  * Remove product from wishlist
//  * @param {Object} wishlistData - Wishlist item data
//  * @param {string} wishlistData.productId - Product ID to remove
//  * @returns {Promise} API response with updated wishlist
//  */
// export const removeFromWishlist = async (wishlistData) => {
//   try {
//     const response = await httpClient.post("/wishlist/remove", wishlistData);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// =============================================================================
// ORDERS API CALLS
// =============================================================================

/**
 * Create new order
 * @param {Object} orderData - Order creation data
 * @param {Array} orderData.items - Array of order items
 * @param {Object} orderData.shippingAddress - Shipping address
 * @param {string} orderData.couponCode - Optional coupon code
 * @returns {Promise} API response with created order
 */
// export const createOrder = async (orderData) => {
//   try {
//     const response = await httpClient.post("/order", orderData);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// /**
//  * Get user's order history
//  * @returns {Promise} API response with orders array
//  */
// export const getUserOrders = async () => {
//   try {
//     const response = await httpClient.get("/order");
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// /**
//  * Get single order by ID
//  * @param {string} orderId - Order ID to fetch
//  * @returns {Promise} API response with order data
//  */
// export const getOrderById = async (orderId) => {
//   try {
//     const response = await httpClient.get(`/order/${orderId}`);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// =============================================================================
// ADDRESS API CALLS
// =============================================================================

/**
 * Create a new address
 * @param {Object} addressData - Address information
 * @param {string} addressData.label - Address label (e.g., "Home", "Office")
 * @param {string} addressData.line1 - Address line 1
 * @param {string} addressData.line2 - Address line 2 (optional)
 * @param {string} addressData.city - City
 * @param {string} addressData.state - State
 * @param {string} addressData.postalCode - Postal code
 * @param {string} addressData.country - Country
 * @returns {Promise} API response with created address
 */
// export const createAddress = async (addressData) => {
//   try {
//     const response = await httpClient.post("/address", addressData);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// /**
//  * Update an existing address
//  * @param {string} addressId - Address ID
//  * @param {Object} addressData - Updated address information
//  * @returns {Promise} API response with updated address
//  */
// export const updateAddress = async (addressId, addressData) => {
//   try {
//     const response = await httpClient.put(`/address/${addressId}`, addressData);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// /**
//  * Delete an address
//  * @param {string} addressId - Address ID
//  * @returns {Promise} API response
//  */
// export const deleteAddress = async (addressId) => {
//   try {
//     const response = await httpClient.delete(`/address/${addressId}`);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// /**
//  * Get a single address by ID
//  * @param {string} addressId - Address ID
//  * @returns {Promise} API response with address
//  */
// export const getAddress = async (addressId) => {
//   try {
//     const response = await httpClient.get(`/address/${addressId}`);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

/**
 * Get shipping price by pincode
 * @param {Object} shippingData - Shipping calculation data
 * @param {string} shippingData.pincode - Delivery pincode
 * @param {number} shippingData.weight - Package weight
 * @returns {Promise} API response with shipping price
 */
// export const getShippingPrice = async (shippingData) => {
//   try {
//     const response = await httpClient.get("/address/shipping-price", {
//       params: shippingData,
//     });
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };
