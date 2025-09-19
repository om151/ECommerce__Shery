// API HTTP client configuration using Axios
// This file creates a configured Axios instance for making API requests

import axios from "axios";

// Get the base API URL from environment variables
// VITE_API_URL should be set in .env file (e.g., http://localhost:5000)
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Create an Axios instance with default configuration
const httpClient = axios.create({
  // Set the base URL for all requests
  baseURL: API_BASE_URL,

  // Set default timeout for requests (10 seconds)
  timeout: 10000,

  // Default headers for all requests
  headers: {
    Accept: "application/json",
  },
});

// Request interceptor - runs before each request is sent
httpClient.interceptors.request.use(
  (config) => {
    // Get authentication token from localStorage if it exists
    const token = localStorage.getItem("authToken");

    // If token exists, add it to Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // If we're sending FormData, let the browser set the multipart boundary
    if (config.data instanceof FormData) {
      // Ensure we don't set Content-Type so Axios/browser can set multipart/form-data with boundary
      if (config.headers && config.headers["Content-Type"]) {
        delete config.headers["Content-Type"];
      }
    } else {
      // For JSON payloads, ensure Content-Type is application/json
      if (config.headers && !config.headers["Content-Type"]) {
        config.headers["Content-Type"] = "application/json";
      }
    }

    // Log the request for debugging (remove in production)
    console.log("Making request to:", config.baseURL + config.url);

    return config;
  },
  (error) => {
    // Handle request errors
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - runs after each response is received
httpClient.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging (remove in production)
    console.log("Response received:", response.status, response.config.url);

    // Return the response data directly
    return response;
  },
  (error) => {
    // Handle different types of response errors
    if (error.response) {
      // Server responded with error status (4xx, 5xx)
      const { status, data } = error.response;

      // Handle authentication errors - redirect to login
      if (status === 401) {
        // Remove invalid token from localStorage
        localStorage.removeItem("authToken");
        // Redirect to login page (you can customize this)
        // window.location.href = '/login';
      }

      // Handle forbidden access
      if (status === 403) {
        console.error("Access forbidden:", data.message);
      }

      // Handle server errors
      if (status >= 500) {
        console.error("Server error:", data.message);
      }

      // Log error for debugging
      console.error("API Error:", status, data);
    } else if (error.request) {
      // Network error - request made but no response received
      console.error("Network error - no response received:", error.request);
    } else {
      // Something else happened in setting up the request
      console.error("Request setup error:", error.message);
    }

    // Always reject the promise so calling code can handle errors
    return Promise.reject(error);
  }
);

// Export the configured HTTP client for use throughout the app
export default httpClient;
