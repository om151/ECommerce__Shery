import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getProductFilters,
  getProducts,
} from "../../../shared/api/User/getProduct.apiService";
import {
  loadMoreProducts,
  resetFilters,
  resetProductsState,
  setAvailableFilters,
  setError,
  setFilter,
  setFiltersLoading,
  setLimit,
  setLoading,
  setMultipleFilters,
  setPage,
  setProducts,
  setShowFilters,
  setViewMode,
  toggleFilters,
} from "../../slices/User/productsSlice";

export const useProducts = () => {
  const dispatch = useDispatch();
  const productsState = useSelector((state) => state.user.products);

  // Fetch products with current filters and pagination
  const fetchProducts = useCallback(
    async (loadMore = false) => {
      try {
        dispatch(setLoading(true));
        dispatch(setError(null));

        const params = {
          page: loadMore
            ? productsState.currentPage + 1
            : productsState.currentPage,
          limit: productsState.limit,
          ...productsState.filters,
        };

        // Remove empty filter values
        Object.keys(params).forEach((key) => {
          if (
            params[key] === "" ||
            params[key] === null ||
            params[key] === undefined
          ) {
            delete params[key];
          }
        });

        const response = await getProducts(params);

        if (response.success) {
          if (loadMore) {
            dispatch(loadMoreProducts(response));
          } else {
            dispatch(setProducts(response));
          }
        } else {
          dispatch(setError(response.message || "Failed to fetch products"));
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        dispatch(
          setError(
            error.response?.data?.message ||
              error.message ||
              "Failed to fetch products"
          )
        );
      } finally {
        dispatch(setLoading(false));
      }
    },
    [
      dispatch,
      productsState.currentPage,
      productsState.limit,
      productsState.filters,
    ]
  );

  // Fetch filter options
  const fetchFilters = useCallback(async () => {
    try {
      dispatch(setFiltersLoading(true));
      const response = await getProductFilters();

      if (response.success) {
        dispatch(setAvailableFilters(response.filters));
      }
    } catch (error) {
      console.error("Error fetching filters:", error);
    } finally {
      dispatch(setFiltersLoading(false));
    }
  }, [dispatch]);

  // Apply filter
  const applyFilter = useCallback(
    (key, value) => {
      dispatch(setFilter({ key, value }));
    },
    [dispatch]
  );

  // Apply multiple filters at once
  const applyMultipleFilters = useCallback(
    (filters) => {
      dispatch(setMultipleFilters(filters));
    },
    [dispatch]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    dispatch(resetFilters());
  }, [dispatch]);

  // Search products
  const searchProducts = useCallback(
    (searchTerm) => {
      dispatch(setFilter({ key: "search", value: searchTerm }));
    },
    [dispatch]
  );

  // Load more products
  const loadMore = useCallback(() => {
    if (productsState.hasNextPage && !productsState.loading) {
      fetchProducts(true);
    }
  }, [fetchProducts, productsState.hasNextPage, productsState.loading]);

  // Change page
  const changePage = useCallback(
    (page) => {
      dispatch(setPage(page));
    },
    [dispatch]
  );

  // Change items per page
  const changeLimit = useCallback(
    (limit) => {
      dispatch(setLimit(limit));
    },
    [dispatch]
  );

  // Toggle filters sidebar
  const toggleFiltersSidebar = useCallback(() => {
    dispatch(toggleFilters());
  }, [dispatch]);

  // Show/hide filters
  const setFiltersVisibility = useCallback(
    (visible) => {
      dispatch(setShowFilters(visible));
    },
    [dispatch]
  );

  // Change view mode
  const changeViewMode = useCallback(
    (mode) => {
      dispatch(setViewMode(mode));
    },
    [dispatch]
  );

  // Reset everything
  const resetState = useCallback(() => {
    dispatch(resetProductsState());
  }, [dispatch]);

  return {
    // State
    ...productsState,

    // Actions
    fetchProducts,
    fetchFilters,
    applyFilter,
    applyMultipleFilters,
    clearFilters,
    searchProducts,
    loadMore,
    changePage,
    changeLimit,
    toggleFiltersSidebar,
    setFiltersVisibility,
    changeViewMode,
    resetState,
  };
};
