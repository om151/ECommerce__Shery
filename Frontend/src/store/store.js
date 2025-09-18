// Redux Store Configuration
// Main store setup using Redux Toolkit

import { configureStore } from "@reduxjs/toolkit";
import addressesSlice from "./slices/User/addressesSlice";
import indexSliceAdmin from "./slices/Admin/indexSlice";
import authSlice from "./slices/Common/authSlice";
import cartSlice from "./slices/User/cartSlice";
import userOrdersSlice from "./slices/User/ordersSlice";
import uiSlice from "./slices/User/uiSlice";
import wishlistSlice from "./slices/User/wishlistSlice";
import indexSliceUser from "./slices/User/index.slice"

export const store = configureStore({
  reducer: {
    // AdminCoupon : indexSlice.coupons,
    // AdminProducts : indexSlice.products,
    // AdminuUi: indexSlice.ui,
    // AdminuStats: indexSlice.stats,
    // AdminUser: indexSlice.users,
    // AdminOrder: indexSlice.orders,

    
    auth: authSlice,
    // cart: cartSlice,
    // ui: uiSlice,
    // addresses: addressesSlice,
    // wishlist: wishlistSlice,
    // userOrders: userOrdersSlice,
    user:indexSliceUser,
    admin: indexSliceAdmin,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
