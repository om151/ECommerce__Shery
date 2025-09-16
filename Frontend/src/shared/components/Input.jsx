// Input Component - Reusable form input field with validation styling
// This component provides consistent styling and behavior for all input fields

import React from 'react';

/**
 * Input component for forms with validation states
 * @param {Object} props - Component props
 * @param {string} props.type - Input type (text, email, password, etc.)
 * @param {string} props.name - Input name attribute
 * @param {string} props.value - Input value
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.label - Label text (optional)
 * @param {boolean} props.required - Whether field is required
 * @param {boolean} props.disabled - Whether input is disabled
 * @param {string} props.error - Error message to display
 * @param {string} props.className - Additional CSS classes
 * @param {function} props.onChange - Change handler function
 * @param {function} props.onBlur - Blur handler function
 * @param {function} props.onFocus - Focus handler function
 * @returns {React.Component} Input component
 */
const Input = ({
  type = 'text',
  name,
  value,
  placeholder,
  label,
  required = false,
  disabled = false,
  error,
  className = '',
  onChange,
  onBlur,
  onFocus,
  ...props
}) => {
  // Base input styles
  const baseInputStyles = 'w-full px-3 py-2 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2';
  
  // Conditional styles based on state
  const conditionalStyles = error 
    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' // Error state
    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'; // Normal state
  
  // Disabled styles
  const disabledStyles = disabled 
    ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
    : 'bg-white text-gray-900';

  // Combine all input styles
  const inputClasses = `
    ${baseInputStyles}
    ${conditionalStyles}
    ${disabledStyles}
    ${className}
  `.trim();

  // Generate unique ID for accessibility (label-input association)
  const inputId = name || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {/* Label (if provided) */}
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {/* Required indicator */}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Input field */}
      <input
        id={inputId}
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={inputClasses}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        {...props}
      />
      
      {/* Error message (if provided) */}
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;