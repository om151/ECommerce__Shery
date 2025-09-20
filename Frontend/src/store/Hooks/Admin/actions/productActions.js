import { useCallback } from "react";
import {
  addVariantToProduct as apiAddVariantToProduct,
  createProductWithVariants as apiCreateProductWithVariants,
  deleteProduct as apiDeleteProduct,
  deleteVariant as apiDeleteVariant,
  editVariant as apiEditVariant,
  getAllProducts as apiGetAllProducts,
  getLowStockProducts as apiGetLowStockProducts,
  updateProduct as apiUpdateProduct,
} from "../../../../shared/api/Admin/product.apiservice.js";
import {
  setProducts as setAdminProducts,
  setLowStockProducts,
} from "../../../slices/Admin/productSlice.js";
import {
  clearProductsError as clearAdminProductsError,
  setProductsError as setAdminProductsError,
  setProductsLoading as setAdminProductsLoading,
} from "../../../slices/Admin/UiSlice.js";

export const createProductActions = (dispatch) => ({
  setProductsLoading: (loading) => dispatch(setAdminProductsLoading(loading)),
  setProductsError: (err) => dispatch(setAdminProductsError(err)),
  clearProductsError: () => dispatch(clearAdminProductsError()),

  fetchProducts: useCallback(
    async (page = 1, limit = 10) => {
      dispatch(setAdminProductsLoading(true));
      dispatch(clearAdminProductsError());
      try {
        const response = await apiGetAllProducts(page, limit);
        // console.log("Fetched products:", response);
        dispatch(setAdminProducts(response));
        dispatch(setAdminProductsLoading(false));
        return { type: "admin/fetchProducts/fulfilled", payload: response };
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch products";
        dispatch(setAdminProductsError(errorMessage));
        dispatch(setAdminProductsLoading(false));
        throw error;
      }
    },
    [dispatch]
  ),

  fetchLowStockProducts: useCallback(
    async (threshold = 5) => {
      try {
        const response = await apiGetLowStockProducts(threshold);
        dispatch(setLowStockProducts(response));
        return {
          type: "admin/fetchLowStockProducts/fulfilled",
          payload: response,
        };
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  ),

  updateProduct: useCallback(
    async (productId, productData) => {
      try {
        const response = await apiUpdateProduct(productId, productData);
        return { type: "admin/updateProduct/fulfilled", payload: response };
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to update product";
        throw new Error(errorMessage);
      }
    },
    [dispatch]
  ),

  // --- Variant CRUD ---
  addVariantToProduct: useCallback(
    async (productId, variantData) => {
      try {
        const response = await apiAddVariantToProduct(productId, variantData);
        return { type: "admin/addVariant/fulfilled", payload: response };
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.message ||
          "Failed to add variant";
        throw new Error(message);
      }
    },
    [dispatch]
  ),

  editVariant: useCallback(
    async (variantId, updateData) => {
      try {
        const response = await apiEditVariant(variantId, updateData);
        return { type: "admin/editVariant/fulfilled", payload: response };
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.message ||
          "Failed to edit variant";
        throw new Error(message);
      }
    },
    [dispatch]
  ),

  deleteVariant: useCallback(
    async (variantId) => {
      try {
        const response = await apiDeleteVariant(variantId);
        return { type: "admin/deleteVariant/fulfilled", payload: response };
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.message ||
          "Failed to delete variant";
        throw new Error(message);
      }
    },
    [dispatch]
  ),

  // Product create & delete
  createProduct: useCallback(
    async (productData) => {
      try {
        // console.log("Creating product with data:", productData);
        const response = await apiCreateProductWithVariants(productData);
        return { type: "admin/createProduct/fulfilled", payload: response };
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.message ||
          "Failed to create product";
        throw new Error(message);
      }
    },
    [dispatch]
  ),

  deleteProduct: useCallback(
    async (productId) => {
      try {
        const response = await apiDeleteProduct(productId);
        return { type: "admin/deleteProduct/fulfilled", payload: response };
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.message ||
          "Failed to delete product";
        throw new Error(message);
      }
    },
    [dispatch]
  ),
});
