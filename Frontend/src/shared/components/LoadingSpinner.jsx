// Loading Spinner Component - Shows loading state throughout the app
// This component provides consistent loading indicators

import React from "react";

/**
 * Loading Spinner component with different sizes and variants
 * @param {Object} props - Component props
 * @param {string} props.size - Spinner size (sm, md, lg)
 * @param {string} props.variant - Spinner style (primary, secondary, white)
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.text - Optional loading text to display
 * @returns {React.Component} Loading spinner component
 */
const LoadingSpinner = ({
  size = "md",
  variant = "primary",
  className = "",
  text,
  ...props
}) => {
  // Size configurations
  const sizeConfig = {
    sm: {
      spinner: "h-4 w-4",
      text: "text-sm",
    },
    md: {
      spinner: "h-6 w-6",
      text: "text-base",
    },
    lg: {
      spinner: "h-8 w-8",
      text: "text-lg",
    },
  };

  // Color configurations based on variant
  const colorConfig = {
    primary: "text-primary-500",
    secondary: "text-secondary-500",
    white: "text-white",
  };

  // Get current size and color classes
  const spinnerSize = sizeConfig[size].spinner;
  const textSize = sizeConfig[size].text;
  const spinnerColor = colorConfig[variant];

  return (
    <div className={`flex items-center justify-center ${className}`} {...props}>
      {/* SVG Spinner */}
      <svg
        className={`animate-spin ${spinnerSize} ${spinnerColor}`}
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        {/* Background circle */}
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        {/* Animated arc */}
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>

      {/* Loading text (if provided) */}
      {text && (
        <span className={`ml-2 ${textSize} ${spinnerColor}`}>{text}</span>
      )}
    </div>
  );
};

/**
 * Full Page Loading Component - Covers entire screen with loading indicator
 * @param {Object} props - Component props
 * @param {string} props.text - Loading text to display
 * @returns {React.Component} Full page loading component
 */
export const FullPageLoading = ({ text = "Loading..." }) => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
      <div className="text-center">
        <LoadingSpinner size="lg" variant="primary" />
        <p className="mt-4 text-lg text-gray-600">{text}</p>
      </div>
    </div>
  );
};

/**
 * Overlay Loading Component - Shows loading over specific content area
 * @param {Object} props - Component props
 * @param {string} props.text - Loading text to display
 * @param {boolean} props.show - Whether to show the overlay
 * @returns {React.Component} Overlay loading component
 */
export const LoadingOverlay = ({ text = "Loading...", show = true }) => {
  if (!show) return null;

  return (
    <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
      <div className="text-center">
        <LoadingSpinner size="md" variant="primary" />
        <p className="mt-2 text-sm text-gray-600">{text}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
