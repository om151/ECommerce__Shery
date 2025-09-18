import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  addNotification,
  clearBrandFilters as clearFilters,
  clearAllNotifications as clearNotifications,
  clearSearch,
  // clearError as clearUIError,
  closeAllModals,
  closeModal,
  openModal,
  removeNotification,
  setFilter as setFilters,
  setSearchLoading,
  setSearchQuery,
  setSearchResults,
  // setError as setUIError,
  setGlobalLoading as setUILoading,
  setFilter as updateFilter,
} from "../../slices/Common/uiSlice.js";

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;


export const useUI = () => {
  const dispatch = useAppDispatch();
  const uiState = useAppSelector((state) => state.user.ui);

  return {
    ...uiState,
    // Actions
    setLoading: (loading) => dispatch(setUILoading(loading)),
    setUIError: (error) => dispatch(setUIError(error)),
    // clearUIError: () => dispatch(clearUIError()),
    addNotification: (notification) => dispatch(addNotification(notification)),
    removeNotification: (id) => dispatch(removeNotification(id)),
    clearNotifications: () => dispatch(clearNotifications()),
    openModal: (modalData) => dispatch(openModal(modalData)),
    closeModal: (modalId) => dispatch(closeModal(modalId)),
    closeAllModals: () => dispatch(closeAllModals()),
    setSearchQuery: (query) => dispatch(setSearchQuery(query)),
    setSearchResults: (results) => dispatch(setSearchResults(results)),
    setSearchLoading: (loading) => dispatch(setSearchLoading(loading)),
    clearSearch: () => dispatch(clearSearch()),
    setFilters: (filters) => dispatch(setFilters(filters)),
    updateFilter: (filterData) => dispatch(updateFilter(filterData)),
    clearFilters: () => dispatch(clearFilters()),
  };
};

export const useNotifications = () => {
  return useAppSelector((state) => state.ui.notifications);
};

export const useModals = () => {
  return useAppSelector((state) => state.ui.modals);
};

export const useFilters = () => {
  return useAppSelector((state) => state.ui.filters);
};

export const useSearch = () => {
  return useAppSelector((state) => ({
    query: state.ui.searchQuery,
    results: state.ui.searchResults,
    isLoading: state.ui.isSearchLoading,
  }));
};