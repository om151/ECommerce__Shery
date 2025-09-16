// AddressForm Component - Reusable form for creating and editing addresses
// This component handles both creation and editing of user addresses

import React, { useEffect, useState } from "react";
import Button from "./Button.jsx";
import Input from "./Input.jsx";

/**
 * AddressForm component
 * @param {Object} props - Component props
 * @param {Object|null} props.address - Existing address data (null for new address)
 * @param {Function} props.onSubmit - Submit handler function
 * @param {Function} props.onCancel - Cancel handler function
 * @param {boolean} props.loading - Loading state
 * @param {Object} props.errors - Form validation errors
 * @returns {React.Component} AddressForm component
 */
const AddressForm = ({
  address = null,
  onSubmit,
  onCancel,
  loading = false,
  errors = {},
}) => {
  // Form state
  const [formData, setFormData] = useState({
    label: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "USA", // Default to USA
  });

  // Initialize form data when address prop changes
  useEffect(() => {
    if (address) {
      setFormData({
        label: address.label || "",
        line1: address.line1 || "",
        line2: address.line2 || "",
        city: address.city || "",
        state: address.state || "",
        postalCode: address.postalCode || "",
        country: address.country || "USA",
      });
    } else {
      // Reset form for new address
      setFormData({
        label: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "USA",
      });
    }
  }, [address]);

  /**
   * Handle input changes
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {address ? "Edit Address" : "Add New Address"}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          disabled={loading}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Address Label */}
        <div>
          <Input
            label="Address Label"
            name="label"
            type="text"
            value={formData.label}
            onChange={handleChange}
            error={errors.label}
            placeholder="e.g., Home, Office, etc."
            required
            disabled={loading}
          />
        </div>

        {/* Address Line 1 */}
        <div>
          <Input
            label="Address Line 1"
            name="line1"
            type="text"
            value={formData.line1}
            onChange={handleChange}
            error={errors.line1}
            placeholder="Street address, building, etc."
            required
            disabled={loading}
          />
        </div>

        {/* Address Line 2 */}
        <div>
          <Input
            label="Address Line 2 (Optional)"
            name="line2"
            type="text"
            value={formData.line2}
            onChange={handleChange}
            error={errors.line2}
            placeholder="Apartment, suite, unit, etc."
            disabled={loading}
          />
        </div>

        {/* City and State */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="City"
              name="city"
              type="text"
              value={formData.city}
              onChange={handleChange}
              error={errors.city}
              placeholder="City"
              required
              disabled={loading}
            />
          </div>
          <div>
            <Input
              label="State"
              name="state"
              type="text"
              value={formData.state}
              onChange={handleChange}
              error={errors.state}
              placeholder="State/Province"
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Postal Code and Country */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Postal Code"
              name="postalCode"
              type="text"
              value={formData.postalCode}
              onChange={handleChange}
              error={errors.postalCode}
              placeholder="ZIP/Postal Code"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.country
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300"
              } ${loading ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`}
              required
              disabled={loading}
            >
              <option value="USA">United States</option>
              <option value="Canada">Canada</option>
              <option value="UK">United Kingdom</option>
              <option value="Australia">Australia</option>
              <option value="India">India</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="Other">Other</option>
            </select>
            {errors.country && (
              <p className="mt-1 text-sm text-red-600">{errors.country}</p>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
            type="button"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            loading={loading}
            disabled={loading}
          >
            {address ? "Update Address" : "Add Address"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;
