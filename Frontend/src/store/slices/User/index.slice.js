import { combineReducers } from "redux";
import addressesSliceReducer from "./addressesSlice"
import cartSliceReduce from "./cartSlice"
import orderSliceReducer from "./ordersSlice"
import uiSliceReducer from "./uiSlice"
import wishlistSliceReduce from "./wishlistSlice"


export default combineReducers({
  addresses: addressesSliceReducer,
  cart:cartSliceReduce,
  orders:orderSliceReducer,
  ui:uiSliceReducer,
  wishlist:wishlistSliceReduce
})