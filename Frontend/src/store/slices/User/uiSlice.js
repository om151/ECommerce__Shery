// UI Slice - Redux Toolkit slice for UI state management
// Handles loading states, notifications, modals, and other UI elements

import { createSlice } from "@reduxjs/toolkit";

// Initial state
const initialState = {
  // Global loading state
  isLoading: false,

  // Notifications
  notifications: [],

  // Modals
  modals: {
    isAddressModalOpen: false,
    isProfileModalOpen: false,
    isConfirmationModalOpen: false,
  },

  // UI preferences
  theme: "light",
  sidebarOpen: false,

  // Search
  searchQuery: "",
  searchResults: [],
  isSearchLoading: false,

  // Filters (for products)
  filters: {
    category: "",
    priceRange: [0, 10000],
    sortBy: "name",
    sortOrder: "asc",
    inStock: false,
    brands: [],
    ratings: 0,
  },
};

// UI slice
const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // Loading state
    setGlobalLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    // Notifications
    addNotification: (state, action) => {
      const notification = {
        id: Date.now() + Math.random(),
        timestamp: Date.now(),
        autoHide: true,
        duration: 5000,
        ...action.payload,
      };
      state.notifications.push(notification);
    },

    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },

    clearAllNotifications: (state) => {
      state.notifications = [];
    },

    // Modals
    openModal: (state, action) => {
      if (state.modals.hasOwnProperty(action.payload)) {
        state.modals[action.payload] = true;
      }
    },

    closeModal: (state, action) => {
      if (state.modals.hasOwnProperty(action.payload)) {
        state.modals[action.payload] = false;
      }
    },

    closeAllModals: (state) => {
      Object.keys(state.modals).forEach((key) => {
        state.modals[key] = false;
      });
    },

    // Theme
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
    },

    setTheme: (state, action) => {
      state.theme = action.payload;
    },

    // Sidebar
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },

    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },

    // Search
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },

    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
    },

    setSearchLoading: (state, action) => {
      state.isSearchLoading = action.payload;
    },

    clearSearch: (state) => {
      state.searchQuery = "";
      state.searchResults = [];
      state.isSearchLoading = false;
    },

    // Filters
    setFilter: (state, action) => {
      const { filterType, value } = action.payload;
      if (state.filters.hasOwnProperty(filterType)) {
        state.filters[filterType] = value;
      }
    },

    setPriceRange: (state, action) => {
      state.filters.priceRange = action.payload;
    },

    addBrandFilter: (state, action) => {
      if (!state.filters.brands.includes(action.payload)) {
        state.filters.brands.push(action.payload);
      }
    },

    removeBrandFilter: (state, action) => {
      state.filters.brands = state.filters.brands.filter(
        (brand) => brand !== action.payload
      );
    },

    clearBrandFilters: (state) => {
      state.filters.brands = [];
    },

    resetFilters: (state) => {
      state.filters = {
        category: "",
        priceRange: [0, 10000],
        sortBy: "name",
        sortOrder: "asc",
        inStock: false,
        brands: [],
        ratings: 0,
      };
    },

    // Reset UI state
    resetUI: (state) => {
      state.notifications = [];
      state.modals = {
        isAddressModalOpen: false,
        isProfileModalOpen: false,
        isConfirmationModalOpen: false,
      };
      state.searchQuery = "";
      state.searchResults = [];
      state.isSearchLoading = false;
      state.sidebarOpen = false;
    },
  },
});

export const {
  // Loading
  setGlobalLoading,

  // Notifications
  addNotification,
  removeNotification,
  clearAllNotifications,

  // Modals
  openModal,
  closeModal,
  closeAllModals,

  // Theme
  toggleTheme,
  setTheme,

  // Sidebar
  toggleSidebar,
  setSidebarOpen,

  // Search
  setSearchQuery,
  setSearchResults,
  setSearchLoading,
  clearSearch,

  // Filters
  setFilter,
  setPriceRange,
  addBrandFilter,
  removeBrandFilter,
  clearBrandFilters,
  resetFilters,

  // Reset
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;
