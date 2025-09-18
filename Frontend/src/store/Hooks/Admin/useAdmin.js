import { useDispatch, useSelector } from "react-redux";
import { createCouponActions } from "./actions/couponActions";
import { createOrderActions } from "./actions/orderActions";
import { createProductActions } from "./actions/productActions";
import { createStatsActions } from "./actions/statsActions";
import { createUserActions } from "./actions/userActions";

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

export const useAdmin = () => {
  const dispatch = useAppDispatch();
  const adminState = useAppSelector((state) => state.admin);

  const stats = createStatsActions(dispatch);
  const users = createUserActions(dispatch);
  const orders = createOrderActions(dispatch);
  const products = createProductActions(dispatch);
  const coupons = createCouponActions(dispatch);

  return {
    ...adminState,
    // spread grouped action handlers so consumers can call them like before
    // e.g. useAdmin().fetchStats(), useAdmin().fetchUsers()
    ...stats,
    ...users,
    ...orders,
    ...products,
    ...coupons,
  };
};
