import {
setProducts as setAdminProducts,
setLowStockProducts,
} from "../../../slices/Admin/productSlice.js";
import {
setProductsLoading as setAdminProductsLoading,
setProductsError as setAdminProductsError,
clearProductsError as clearAdminProductsError,
} from "../../../slices/Admin/UiSlice.js";
import {
getAllProducts as apiGetAllProducts,
getLowStockProducts as apiGetLowStockProducts,
updateProduct as apiUpdateProduct,
} from "../../../../shared/api/Admin/product.apiservice.js";
import { useCallback } from "react";


export const createProductActions = (dispatch) => ({
setProductsLoading: (loading) => dispatch(setAdminProductsLoading(loading)),
setProductsError: (err) => dispatch(setAdminProductsError(err)),
clearProductsError: () => dispatch(clearAdminProductsError()),


fetchProducts:useCallback( async (page = 1, limit = 10) => {
dispatch(setAdminProductsLoading(true));
dispatch(clearAdminProductsError());
try {
const response = await apiGetAllProducts(page, limit);
dispatch(setAdminProducts(response));
dispatch(setAdminProductsLoading(false));
return { type: "admin/fetchProducts/fulfilled", payload: response };
} catch (error) {
const errorMessage =
error.response?.data?.message || error.message || "Failed to fetch products";
dispatch(setAdminProductsError(errorMessage));
dispatch(setAdminProductsLoading(false));
throw error;
}
},[dispatch]),


fetchLowStockProducts: useCallback( async (threshold = 5) => {
try {
const response = await apiGetLowStockProducts(threshold);
dispatch(setLowStockProducts(response));
return { type: "admin/fetchLowStockProducts/fulfilled", payload: response };
} catch (error) {
throw error;
}
},[dispatch]),


updateProduct: useCallback( async (productId, productData) => {
try {
const response = await apiUpdateProduct(productId, productData);
return { type: "admin/updateProduct/fulfilled", payload: response };
} catch (error) {
const errorMessage =
error.response?.data?.message || error.message || "Failed to update product";
throw new Error(errorMessage);
}
},
[dispatch])
});