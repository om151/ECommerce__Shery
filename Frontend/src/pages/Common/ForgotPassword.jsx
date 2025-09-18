// ForgotPassword Page - Password reset request form
// This page allows users to request a password reset by entering their email

import React, { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../Components/Common/Button.jsx";
import Input from "../../Components/Common/Input.jsx";
import { forgotPassword } from "../../shared/api/Common/auth.apiServices.js";

/**
 * ForgotPassword page component
 * @returns {React.Component} ForgotPassword page component
 */
const ForgotPassword = () => {
  // State management
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} - True if email is valid
   */
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset previous messages
    setError("");
    setMessage("");

    // Validate email
    if (!email) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await forgotPassword({ email });

      // Show success message
      setMessage(
        response.message || "If this email exists, a reset link has been sent."
      );
      setIsSubmitted(true);

      // Clear form
      setEmail("");
    } catch (error) {
      console.error("Forgot password error:", error);

      // Handle different error types
      if (error.response?.status === 403) {
        setError("Too many reset requests. Please try again later.");
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle input change
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    setEmail(e.target.value);
    // Clear error when user starts typing
    if (error) setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <svg
              className="h-6 w-6 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot your password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Don't worry, we'll send you reset instructions.
          </p>
        </div>

        {!isSubmitted ? (
          /* Reset Request Form */
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Input
                label="Email address"
                name="email"
                type="email"
                value={email}
                onChange={handleChange}
                required
                placeholder="Enter your email address"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </div>

            {/* Back to Login */}
            <div className="text-center">
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500 text-sm"
              >
                ← Back to login
              </Link>
            </div>
          </form>
        ) : (
          /* Success Message */
          <div className="mt-8">
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    {message}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="text-sm text-gray-600 space-y-2">
                <p>• Check your email (including spam/junk folder)</p>
                <p>• Click the reset link in the email</p>
                <p>• Follow the instructions to create a new password</p>
              </div>

              <div className="flex flex-col space-y-3">
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full"
                  onClick={() => {
                    setIsSubmitted(false);
                    setMessage("");
                    setEmail("");
                  }}
                >
                  Send Another Email
                </Button>

                <div className="text-center">
                  <Link
                    to="/login"
                    className="font-medium text-primary-600 hover:text-primary-500 text-sm"
                  >
                    ← Back to login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
