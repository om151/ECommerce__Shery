
import { useDispatch, useSelector } from "react-redux";

import {
  addAddress,
  clearError as clearAddressesError,
  clearSelectedAddress,
  removeAddress,
  setAddresses,
  setError as setAddressesError,
  setLoading as setAddressesLoading,
  setSelectedAddress,
  updateAddress,
} from "../../slices/User/addressesSlice.js";

import {

  createAddress as apiCreateAddress,
  deleteAddress as apiDeleteAddress,
  getAddress as apiGetAddress,
  getUserAddresses as apiGetUserAddresses,
  updateAddress as apiUpdateAddress,
} from "../../../shared/api/User/address.apiService.js";

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

export const useAddresses = () => {
  const dispatch = useAppDispatch();
  const addressesState = useAppSelector((state) => state.user.addresses);

  return {
    ...addressesState,
    // Actions
    setLoading: (loading) => dispatch(setAddressesLoading(loading)),
    setAddressesError: (error) => dispatch(setAddressesError(error)),
    clearAddressesError: () => dispatch(clearAddressesError()),
    setSelectedAddress: (address) => dispatch(setSelectedAddress(address)),
    clearSelectedAddress: () => dispatch(clearSelectedAddress()),

    // API functions with proper error handling
    fetchAddresses: async () => {
      dispatch(setAddressesLoading(true));
      dispatch(clearAddressesError());
      try {
        const response = await apiGetUserAddresses();
        dispatch(setAddresses(response.addresses || []));
        return {
          type: "addresses/fetchAddresses/fulfilled",
          payload: response,
        };
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch addresses";
        dispatch(setAddressesError(errorMessage));
        throw error;
      }
    },

    createAddress: async (addressData) => {
      dispatch(setAddressesLoading(true));
      dispatch(clearAddressesError());
      try {
        const response = await apiCreateAddress(addressData);
        dispatch(addAddress(response.address));
        return { type: "addresses/createAddress/fulfilled", payload: response };
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to create address";
        dispatch(setAddressesError(errorMessage));
        throw error;
      }
    },

    updateAddress: async (id, addressData) => {
      dispatch(setAddressesLoading(true));
      dispatch(clearAddressesError());
      try {
        const response = await apiUpdateAddress(id, addressData);
        dispatch(updateAddress({ id, ...response.address }));
        return { type: "addresses/updateAddress/fulfilled", payload: response };
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to update address";
        dispatch(setAddressesError(errorMessage));
        throw error;
      }
    },

    deleteAddress: async (addressId) => {
      dispatch(setAddressesLoading(true));
      dispatch(clearAddressesError());
      try {
        await apiDeleteAddress(addressId);
        dispatch(removeAddress(addressId));
        return {
          type: "addresses/deleteAddress/fulfilled",
          payload: addressId,
        };
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to delete address";
        dispatch(setAddressesError(errorMessage));
        throw error;
      }
    },

    getAddress: async (addressId) => {
      dispatch(setAddressesLoading(true));
      dispatch(clearAddressesError());
      try {
        const response = await apiGetAddress(addressId);
        dispatch(setSelectedAddress(response.address));
        return { type: "addresses/getAddress/fulfilled", payload: response };
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to get address";
        dispatch(setAddressesError(errorMessage));
        throw error;
      }
    },
  };
};