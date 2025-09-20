import { combineReducers } from "redux";
import addressesSliceReducer from "./addressesSlice";
import cartSliceReduce from "./cartSlice";
import orderSliceReducer from "./ordersSlice";
import productsSliceReducer from "./productsSlice";
import uiSliceReducer from "./uiSlice";
import wishlistSliceReduce from "./wishlistSlice";

export default combineReducers({
  addresses: addressesSliceReducer,
  cart: cartSliceReduce,
  orders: orderSliceReducer,
  products: productsSliceReducer,
  ui: uiSliceReducer,
  wishlist: wishlistSliceReduce,
});
