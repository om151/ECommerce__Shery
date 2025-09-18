// ResetPassword Page - Password reset with token validation
// This page allows users to set a new password using the token from reset email

import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Button from "../../Components/Common/Button.jsx";
import Input from "../../Components/Common/Input.jsx";
import { resetPassword } from "../../shared/api/Common/auth.apiServices.js";

/**
 * ResetPassword page component
 * @returns {React.Component} ResetPassword page component
 */
const ResetPassword = () => {
  // Router hooks
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get token from URL
  const token = searchParams.get("token");

  // State management
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  /**
   * Check if token exists on component mount
   */
  useEffect(() => {
    if (!token) {
      setTokenError(true);
    }
  }, [token]);

  /**
   * Validate password
   * @param {string} password - Password to validate
   * @returns {string|null} - Error message or null if valid
   */
  const validatePassword = (password) => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    if (password.length > 128) {
      return "Password must be less than 128 characters";
    }
    // Check for at least one letter and one number
    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
      return "Password must contain at least one letter and one number";
    }
    return null;
  };

  /**
   * Validate form data
   * @returns {Object} - Validation errors object
   */
  const validateForm = () => {
    const validationErrors = {};

    // Password validation
    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      validationErrors.newPassword = passwordError;
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      validationErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      validationErrors.confirmPassword = "Passwords don't match";
    }

    return validationErrors;
  };

  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset previous errors
    setErrors({});

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await resetPassword(token, {
        newPassword: formData.newPassword,
      });

      // Show success state
      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login", {
          state: {
            message:
              "Password reset successful! Please log in with your new password.",
          },
        });
      }, 3000);
    } catch (error) {
      console.error("Reset password error:", error);

      // Handle different error types
      if (error.response?.status === 400) {
        if (error.response.data.message?.includes("token")) {
          setErrors({
            general:
              "Reset link has expired or is invalid. Please request a new reset link.",
          });
        } else {
          setErrors({
            general:
              error.response.data.message ||
              "Invalid request. Please try again.",
          });
        }
      } else {
        setErrors({
          general: "Something went wrong. Please try again later.",
        });
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
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Show error if no token
  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Invalid Reset Link
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              This password reset link is invalid or has expired.
            </p>
            <div className="mt-6 space-y-3">
              <Link to="/forgot-password">
                <Button variant="primary" size="md" className="w-full">
                  Request New Reset Link
                </Button>
              </Link>
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
      </div>
    );
  }

  // Show success message
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
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
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Password Reset Successful!
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Your password has been updated successfully.
              <br />
              Redirecting you to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main reset password form
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
            Set new password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please enter your new password below.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* General Error Message */}
          {errors.general && (
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
                  <p className="text-sm font-medium text-red-800">
                    {errors.general}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* New Password */}
            <div>
              <Input
                label="New Password"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                error={errors.newPassword}
                required
                placeholder="Enter your new password"
                disabled={isLoading}
                autoComplete="new-password"
              />
              <div className="mt-1 text-xs text-gray-600">
                Password must be at least 6 characters with letters and numbers
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <Input
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                required
                placeholder="Confirm your new password"
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>
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
              {isLoading ? "Updating Password..." : "Update Password"}
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
      </div>
    </div>
  );
};

export default ResetPassword;
