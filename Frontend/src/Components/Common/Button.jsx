// Button Component - Reusable button with different variants and sizes
// This component provides consistent styling and behavior for all buttons in the app

import React from 'react';

/**
 * Button component with multiple variants and sizes
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.variant - Button style variant (primary, secondary, outline, ghost)
 * @param {string} props.size - Button size (sm, md, lg)
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {boolean} props.loading - Whether button is in loading state
 * @param {string} props.className - Additional CSS classes
 * @param {function} props.onClick - Click handler function
 * @param {string} props.type - Button type (button, submit, reset)
 * @returns {React.Component} Button component
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  // Base button styles that apply to all variants
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  // Variant-specific styles
  const variantStyles = {
    // Primary button - main call-to-action style
    primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 shadow-sm hover:shadow-md',
    
    // Secondary button - less prominent actions
    secondary: 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200 focus:ring-secondary-500 border border-secondary-200',
    
    // Outline button - minimal style with border
    outline: 'border border-primary-500 text-primary-500 hover:bg-primary-50 focus:ring-primary-500',
    
    // Ghost button - minimal style without border
    ghost: 'text-secondary-600 hover:bg-secondary-100 focus:ring-secondary-500',
    
    // Danger button - for destructive actions
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-sm hover:shadow-md',
    
    // Success button - for positive actions
    success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500 shadow-sm hover:shadow-md'
  };

  // Size-specific styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',      // Small button
    md: 'px-4 py-2 text-base',      // Medium button (default)
    lg: 'px-6 py-3 text-lg'         // Large button
  };

  // Combine all styles
  const buttonClasses = `
    ${baseStyles} 
    ${variantStyles[variant]} 
    ${sizeStyles[size]} 
    ${className}
  `.trim();

  // Handle button click
  const handleClick = (e) => {
    // Don't call onClick if button is disabled or loading
    if (disabled || loading) return;
    
    // Call the provided onClick handler
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {/* Show loading spinner if loading prop is true */}
      {loading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4" 
          fill="none" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      
      {/* Button content */}
      {children}
    </button>
  );
};

export default Button;