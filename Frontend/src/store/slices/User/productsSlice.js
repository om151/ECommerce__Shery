import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Products data
  products: [],
  totalProducts: 0,
  currentPage: 1,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,

  // Loading states
  loading: false,
  filtersLoading: false,
  error: null,

  // Filter options from backend
  availableFilters: {
    categories: [],
    brands: [],
    colors: [],
    sizes: [],
    priceRange: { min: 0, max: 0 },
  },

  // Current applied filters
  filters: {
    search: "",
    category: "",
    brand: "",
    color: "",
    size: "",
    minPrice: "",
    maxPrice: "",
    inStock: true,
    sortBy: "createdAt",
    sortOrder: "desc",
  },

  // Pagination
  limit: 20,

  // UI states
  showFilters: false,
  viewMode: "grid", // grid or list
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    // Loading states
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setFiltersLoading: (state, action) => {
      state.filtersLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },

    // Products data
    setProducts: (state, action) => {
      const {
        products,
        total,
        currentPage,
        totalPages,
        hasNextPage,
        hasPrevPage,
      } = action.payload;
      state.products = products;
      state.totalProducts = total;
      state.currentPage = currentPage;
      state.totalPages = totalPages;
      state.hasNextPage = hasNextPage;
      state.hasPrevPage = hasPrevPage;
    },

    // Load more products (append to existing)
    loadMoreProducts: (state, action) => {
      const {
        products,
        total,
        currentPage,
        totalPages,
        hasNextPage,
        hasPrevPage,
      } = action.payload;
      state.products = [...state.products, ...products];
      state.totalProducts = total;
      state.currentPage = currentPage;
      state.totalPages = totalPages;
      state.hasNextPage = hasNextPage;
      state.hasPrevPage = hasPrevPage;
    },

    // Filter options
    setAvailableFilters: (state, action) => {
      state.availableFilters = action.payload;
    },

    // Applied filters
    setFilter: (state, action) => {
      const { key, value } = action.payload;
      state.filters[key] = value;
      // Reset to first page when filters change
      state.currentPage = 1;
    },

    setMultipleFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      // Reset to first page when filters change
      state.currentPage = 1;
    },

    resetFilters: (state) => {
      state.filters = {
        search: "",
        category: "",
        brand: "",
        color: "",
        size: "",
        minPrice: "",
        maxPrice: "",
        inStock: true,
        sortBy: "createdAt",
        sortOrder: "desc",
      };
      state.currentPage = 1;
    },

    // Pagination
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },

    setLimit: (state, action) => {
      state.limit = action.payload;
      state.currentPage = 1; // Reset to first page when limit changes
    },

    // UI states
    toggleFilters: (state) => {
      state.showFilters = !state.showFilters;
    },

    setShowFilters: (state, action) => {
      state.showFilters = action.payload;
    },

    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },

    // Reset state
    resetProductsState: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const {
  setLoading,
  setFiltersLoading,
  setError,
  setProducts,
  loadMoreProducts,
  setAvailableFilters,
  setFilter,
  setMultipleFilters,
  resetFilters,
  setPage,
  setLimit,
  toggleFilters,
  setShowFilters,
  setViewMode,
  resetProductsState,
} = productsSlice.actions;

export default productsSlice.reducer;
