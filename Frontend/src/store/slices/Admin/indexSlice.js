// combine admin reducers into a single slice reducer for ease of use
import { combineReducers } from "redux";
import {statsReducer} from "./statsSlice";
import {usersReducer} from "./userSlice";
import ordersReducer from "./orderSlice";
import productsReducer from "./productSlice";
import couponsReducer from "./CouponSlice";
import uiReducer from "./UiSlice";


export default combineReducers({
stats: statsReducer,
users: usersReducer,
orders: ordersReducer,
products: productsReducer,
coupons: couponsReducer,
ui: uiReducer,
});