// Profile Page - User profile management and order history
// This page allows users to view and edit their profile information

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../Components/Common/Button.jsx";
import Input from "../../Components/Common/Input.jsx";
import LoadingSpinner from "../../Components/Common/LoadingSpinner.jsx";
import AddressForm from "../../Components/User/AddressForm.jsx";

import { useAuth } from "../../store/Hooks/Common/hook.useAuth.js";
import { useAddresses } from "../../store/Hooks/User/hook.useAddress.js";
import { useOrders } from "../../store/Hooks/User/hook.useOrder.js";

/**
 * Profile page component
 * @returns {React.Component} Profile page component
 */
const Profile = () => {
  const { user, isLoading, updateUserProfile, isAdmin } = useAuth();
  const { orders, isLoading: ordersLoading, fetchOrders } = useOrders();
  const {
    addresses,
    isLoading: addressesLoading,
    fetchAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    error: addressError,
  } = useAddresses();

  // State management
  const [activeTab, setActiveTab] = useState("profile"); // 'profile', 'orders', 'addresses'
  const [saving, setSaving] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    // currentPassword: "",
    // newPassword: "",
    // confirmPassword: "",
  });

  const [profileErrors, setProfileErrors] = useState({});
  const [profileSuccess, setProfileSuccess] = useState("");

  // Address management state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressFormLoading, setAddressFormLoading] = useState(false);
  const [addressSuccess, setAddressSuccess] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  /**
   * Load profile data based on active tab
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        if (activeTab === "profile") {
          // Profile data is already in Redux state
        } else if (activeTab === "orders" && !isAdmin) {
          await fetchOrders();
        } else if (activeTab === "addresses" && !isAdmin) {
          await fetchAddresses();
        }
      } catch (error) {
        console.error(`Error loading ${activeTab} data:`, error);
      }
    };

    loadData();
  }, [activeTab, isAdmin]);

  // Ensure admins stay on the profile tab only
  useEffect(() => {
    if (isAdmin && activeTab !== "profile") {
      setActiveTab("profile");
    }
  }, [isAdmin, activeTab]);

  /**
   * Scroll to top when component mounts or when authentication loading is complete
   */
  useEffect(() => {
    // Only scroll to top when we're not loading (authentication check is complete)
    if (!isLoading) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isLoading]);

  /**
   * Handle profile form input changes
   */
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field errors when user starts typing
    if (profileErrors[name]) {
      setProfileErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  /**
   * Validate profile form
   */
  const validateProfileForm = () => {
    const errors = {};

    if (!profileForm.name.trim()) {
      errors.name = "Name is required";
    }

    // if (!profileForm.email.trim()) {
    //   errors.email = "Email is required";
    // } else if (!/\S+@\S+\.\S+/.test(profileForm.email)) {
    //   errors.email = "Please enter a valid email";
    // }

    if (!profileForm.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(profileForm.phone)) {
      errors.phone = "Please enter a valid 10-digit phone number";
    }

    // Password validation (only if changing password)
    // if (
    //   profileForm.currentPassword ||
    //   profileForm.newPassword ||
    //   profileForm.confirmPassword
    // ) {
    //   if (!profileForm.currentPassword) {
    //     errors.currentPassword = "Current password is required";
    //   }

    //   if (!profileForm.newPassword) {
    //     errors.newPassword = "New password is required";
    //   } else if (profileForm.newPassword.length < 6) {
    //     errors.newPassword = "New password must be at least 6 characters";
    //   }

    //   if (profileForm.newPassword !== profileForm.confirmPassword) {
    //     errors.confirmPassword = "Passwords do not match";
    //   }
    // }

    return errors;
  };

  /**
   * Handle profile form submission
   */
  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    const errors = validateProfileForm();
    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    setSaving(true);
    setProfileErrors({});
    // Don't clear success message here - let it be cleared only on error

    try {
      // Prepare update data
      const updateData = {
        name: profileForm.name,
        // email: profileForm.email,
        phone: profileForm.phone,
      };

      // Add password data if changing password
      // if (profileForm.currentPassword) {
      //   updateData.currentPassword = profileForm.currentPassword;
      //   updateData.newPassword = profileForm.newPassword;
      // }

      // Update profile
      const response = await updateUserProfile(updateData);

      // Show success message
      setProfileSuccess("Profile updated successfully!");

      setTimeout(() => setProfileSuccess(""), 5000);
    } catch (error) {
      console.error("Error updating profile:", error);

      // Clear success message on error
      setProfileSuccess("");

      if (error.response?.data?.errors) {
        const serverErrors = {};
        error.response.data.errors.forEach((err) => {
          serverErrors[err.path] = err.msg;
        });
        setProfileErrors(serverErrors);
      } else {
        setProfileErrors({
          general: error.response?.data?.message || "Failed to update profile",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  // =============================================================================
  // ADDRESS MANAGEMENT FUNCTIONS
  // =============================================================================

  /**
   * Handle adding a new address
   * @param {Object} addressData - Address form data
   */
  const handleAddAddress = async (addressData) => {
    setAddressFormLoading(true);
    setAddressSuccess("");

    try {
      await createAddress(addressData);

      // Show success message and hide form
      setAddressSuccess("Address added successfully!");
      setShowAddressForm(false);

      // Clear success message after 3 seconds
      setTimeout(() => setAddressSuccess(""), 3000);
    } catch (error) {
      console.error("Error adding address:", error);
    } finally {
      setAddressFormLoading(false);
    }
  };

  /**
   * Handle editing an address
   * @param {Object} addressData - Updated address form data
   */
  const handleUpdateAddress = async (addressData) => {
    if (!editingAddress) return;

    setAddressFormLoading(true);
    setAddressSuccess("");

    try {
      await updateAddress(editingAddress._id, addressData);

      // Show success message and hide form
      setAddressSuccess("Address updated successfully!");
      setEditingAddress(null);
      setShowAddressForm(false);

      // Clear success message after 3 seconds
      setTimeout(() => setAddressSuccess(""), 3000);
    } catch (error) {
      console.error("Error updating address:", error);
    } finally {
      setAddressFormLoading(false);
    }
  };

  /**
   * Handle deleting an address
   * @param {string} addressId - Address ID to delete
   */
  const handleDeleteAddress = async (addressId) => {
    try {
      await deleteAddress(addressId);

      // Show success message
      setAddressSuccess("Address deleted successfully!");
      setDeleteConfirm(null);

      // Clear success message after 3 seconds
      setTimeout(() => setAddressSuccess(""), 3000);
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  /**
   * Handle starting to edit an address
   * @param {Object} address - Address to edit
   */
  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowAddressForm(true);
    setAddressSuccess("");
  };

  /**
   * Handle canceling address form
   */
  const handleCancelAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
    setAddressSuccess("");
  };

  /**
   * Handle starting to add new address
   */
  const handleNewAddress = () => {
    setEditingAddress(null);
    setShowAddressForm(true);
    setAddressSuccess("");
  };

  /**
   * Format order status for display
   */
  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return statusClasses[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-heading text-gray-900">
            My Account
          </h1>
          <p className="mt-2 text-gray-600">
            {isAdmin
              ? "Manage your profile"
              : "Manage your profile, orders, and preferences"}
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3">
            <nav className="bg-white shadow rounded-lg p-6">
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                      activeTab === "profile"
                        ? "bg-primary-100 text-primary-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <svg
                      className="w-5 h-5 inline mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Profile Information
                  </button>
                </li>
                {!isAdmin && (
                  <>
                    <li>
                      <button
                        onClick={() => setActiveTab("orders")}
                        className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                          activeTab === "orders"
                            ? "bg-primary-100 text-primary-700 font-medium"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <svg
                          className="w-5 h-5 inline mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                          />
                        </svg>
                        Order History
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab("addresses")}
                        className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                          activeTab === "addresses"
                            ? "bg-primary-100 text-primary-700 font-medium"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <svg
                          className="w-5 h-5 inline mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Saved Addresses
                      </button>
                    </li>
                    <li>
                      <Link
                        to="/wishlist"
                        className="block w-full text-left px-4 py-2 rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                      >
                        <svg
                          className="w-5 h-5 inline mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                        Wishlist
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className=" h-screen lg:col-span-9 mt-8 lg:mt-0">
            <div className="bg-white shadow rounded-lg">
              {/* Profile Information Tab */}
              {activeTab === "profile" && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Profile Information
                  </h2>

                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    {/* Success Message */}
                    {profileSuccess && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex">
                          <svg
                            className="w-5 h-5 text-green-400 mt-0.5 mr-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <p className="text-sm text-green-700">
                            {profileSuccess}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* General Error Message */}
                    {profileErrors.general && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex">
                          <svg
                            className="w-5 h-5 text-red-400 mt-0.5 mr-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <p className="text-sm text-red-700">
                            {profileErrors.general}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <Input
                          label="Full Name"
                          name="name"
                          value={profileForm.name}
                          onChange={handleProfileChange}
                          error={profileErrors.name}
                          required
                        />
                      </div>

                      <div className="display:block">
                        <Input
                          label="Email Address"
                          name="email"
                          type="email"
                          value={profileForm.email}
                          onChange={handleProfileChange}
                          error={profileErrors.email}
                          required
                          disabled
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <Input
                          label="Phone Number"
                          name="phone"
                          type="tel"
                          value={profileForm.phone}
                          onChange={handleProfileChange}
                          error={profileErrors.phone}
                          required
                        />
                      </div>
                    </div>

                    {/* Password Change Section */}
                    {/* <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Change Password
                      </h3>
                      <p className="text-sm text-gray-600 mb-6">
                        Leave blank if you don't want to change your password
                      </p>

                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <Input
                            label="Current Password"
                            name="currentPassword"
                            type="password"
                            value={profileForm.currentPassword}
                            onChange={handleProfileChange}
                            error={profileErrors.currentPassword}
                          />
                        </div>

                        <div>
                          <Input
                            label="New Password"
                            name="newPassword"
                            type="password"
                            value={profileForm.newPassword}
                            onChange={handleProfileChange}
                            error={profileErrors.newPassword}
                          />
                        </div>

                        <div>
                          <Input
                            label="Confirm New Password"
                            name="confirmPassword"
                            type="password"
                            value={profileForm.confirmPassword}
                            onChange={handleProfileChange}
                            error={profileErrors.confirmPassword}
                          />
                        </div>
                      </div>
                    </div> */}

                    {/* Submit Button */}
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        variant="primary"
                        loading={saving}
                        disabled={saving}
                      >
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Order History Tab */}
              {activeTab === "orders" && !isAdmin && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Order History
                  </h2>

                  {ordersLoading ? (
                    <div className="flex justify-center py-12">
                      <LoadingSpinner size="lg" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <svg
                        className="w-16 h-16 text-gray-400 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No orders yet
                      </h3>
                      <p className="text-gray-600 mb-6">
                        When you place orders, they'll appear here.
                      </p>
                      <Link to="/">
                        <Button variant="primary">Start Shopping</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map((order) => (
                        <div
                          key={order._id}
                          className="border border-gray-200 rounded-lg p-6"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                Order #{order._id.slice(-8)}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Placed on{" "}
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                                order.status
                              )}`}
                            >
                              {order.status.charAt(0).toUpperCase() +
                                order.status.slice(1)}
                            </span>
                          </div>

                          {/* Order Items */}
                          <div className="space-y-3 mb-4">
                            {order.items?.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-4"
                              >
                                <img
                                  src={
                                    item.product?.image ||
                                    "/api/placeholder/50/50"
                                  }
                                  alt={item.product?.name || "Product"}
                                  className="w-12 h-12 object-cover rounded-md"
                                />
                                <div className="flex-1">
                                  <h4 className="text-sm font-medium text-gray-900">
                                    {item.product?.name || "Product"}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Qty: {item.quantity}
                                  </p>
                                </div>
                                <p className="text-sm font-medium text-gray-900">
                                  $
                                  {((item.price || 0) * item.quantity).toFixed(
                                    2
                                  )}
                                </p>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <p className="text-lg font-semibold text-gray-900">
                              Total: ${order.total?.toFixed(2) || "0.00"}
                            </p>
                            <div className="space-x-3">
                              <Link to={`/order/${order._id}`}>
                                <Button variant="outline" size="sm">
                                  View Details
                                </Button>
                              </Link>
                              {order.status === "delivered" && (
                                <Button variant="primary" size="sm">
                                  Reorder
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === "addresses" && !isAdmin && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Saved Addresses
                    </h2>
                    {!showAddressForm && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleNewAddress}
                      >
                        Add New Address
                      </Button>
                    )}
                  </div>

                  {/* Success Message */}
                  {addressSuccess && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
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
                            {addressSuccess}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {addressError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
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
                            {addressError}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Address Form */}
                  {showAddressForm && (
                    <div className="mb-6">
                      <AddressForm
                        address={editingAddress}
                        onSubmit={
                          editingAddress
                            ? handleUpdateAddress
                            : handleAddAddress
                        }
                        onCancel={handleCancelAddressForm}
                        loading={addressFormLoading}
                        errors={{}}
                      />
                    </div>
                  )}

                  {addressesLoading ? (
                    <div className="flex justify-center py-12">
                      <LoadingSpinner size="lg" />
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="text-center py-12">
                      <svg
                        className="w-16 h-16 text-gray-400 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No saved addresses
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Add addresses for faster checkout.
                      </p>
                      <Button variant="primary" onClick={handleNewAddress}>
                        Add Your First Address
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      {addresses.map((address) => (
                        <div
                          key={address._id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-gray-900">
                                {address.label}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {address.line1}
                                {address.line2 && (
                                  <>
                                    <br />
                                    {address.line2}
                                  </>
                                )}
                                <br />
                                {address.city}, {address.state}{" "}
                                {address.postalCode}
                                <br />
                                {address.country}
                              </p>
                            </div>
                            <div className="flex flex-col space-y-2 ml-4">
                              <button
                                className="text-sm text-primary-600 hover:text-primary-800"
                                onClick={() => handleEditAddress(address)}
                              >
                                Edit
                              </button>
                              <button
                                className="text-sm text-red-600 hover:text-red-800"
                                onClick={() => setDeleteConfirm(address._id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Delete Confirmation Modal */}
                  {deleteConfirm && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                            <svg
                              className="h-6 w-6 text-red-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mt-4">
                            Delete Address
                          </h3>
                          <div className="mt-2 px-7 py-3">
                            <p className="text-sm text-gray-500">
                              Are you sure you want to delete this address? This
                              action cannot be undone.
                            </p>
                          </div>
                          <div className="flex justify-center gap-4 mt-4">
                            <Button
                              variant="secondary"
                              onClick={() => setDeleteConfirm(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="danger"
                              onClick={() => handleDeleteAddress(deleteConfirm)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
