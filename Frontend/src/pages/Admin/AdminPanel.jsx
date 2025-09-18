// AdminPanel.jsx - Admin dashboard page
// This page provides administrative functionality for managing the e-commerce platform

import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar.jsx";
import CouponsTab from "../../components/admin/CouponsTab.jsx";
import OrdersTab from "../../components/admin/OrdersTab.jsx";
import OverviewTab from "../../components/admin/overviewTab.jsx";
import ProductsTab from "../../components/admin/ProductsTab.jsx";
import UsersTab from "../../components/admin/UsersTab.jsx";
import { useAdmin } from "../../store/Hooks/Admin/useAdmin.js"; //New
import { useAuth } from "../../store/Hooks/Common/hook.useAuth.js";

/**
 * AdminPanel component - Main admin dashboard
 * @returns {React.Component} AdminPanel component
 */
const AdminPanel = () => {
  const { user } = useAuth();
  const { initializeAdminDashboard } = useAdmin();
  const [activeTab, setActiveTab] = useState("overview");

  // Initialize admin dashboard data on mount
  useEffect(() => {
    if (user && user.role === "admin") {
      initializeAdminDashboard();
    }
  }, [user, initializeAdminDashboard]);

  // Redirect if user is not admin (additional safety check)
  useEffect(() => {
    if (user && user.role !== "admin") {
      console.warn("Unauthorized access attempt to admin panel");
      // You could dispatch a notification here if needed
    }
  }, [user]);

  // Admin navigation tabs
  const adminTabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "users", label: "Users", icon: "👥" },
    { id: "products", label: "Products", icon: "📦" },
    { id: "orders", label: "Orders", icon: "🛒" },
    { id: "coupons", label: "Coupons", icon: "🎟️" },
    { id: "reviews", label: "Reviews", icon: "⭐" },
    { id: "analytics", label: "Analytics", icon: "📈" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab />;
      case "users":
        return <UsersTab />;
      case "products":
        return <ProductsTab />;
      case "orders":
        return <OrdersTab />;
      case "coupons":
        return <CouponsTab />;
      case "reviews":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Review Management
            </h2>
            <p className="text-gray-600">
              Monitor and moderate product reviews.
            </p>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800">🚧 Feature coming soon...</p>
            </div>
          </div>
        );
      case "analytics":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Analytics & Reports
            </h2>
            <p className="text-gray-600">
              View detailed analytics and generate reports.
            </p>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800">🚧 Feature coming soon...</p>
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              System Settings
            </h2>
            <p className="text-gray-600">
              Configure system settings and preferences.
            </p>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800">🚧 Feature coming soon...</p>
            </div>
          </div>
        );
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, {user?.firstName} {user?.lastName}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Role: <span className="font-medium text-blue-600">Admin</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <AdminSidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              tabs={adminTabs}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
