// initialState.js
export const initialAdminState = {
stats: {
totalUsers: 0,
totalOrders: 0,
totalProducts: 0,
totalRevenue: 0,
},


users: {
list: [],
total: 0,
currentPage: 1,
totalPages: 0,
},


orders: {
list: [],
total: 0,
currentPage: 1,
totalPages: 0,
recentOrders: [],
allOrders: [],
},


products: {
list: [],
total: 0,
currentPage: 1,
totalPages: 0,
lowStockProducts: [],
},


coupons: {
list: [],
total: 0,
currentPage: 1,
totalPages: 0,
},


isLoading: {
stats: false,
users: false,
orders: false,
products: false,
coupons: false,
},


errors: {
stats: null,
users: null,
orders: null,
products: null,
coupons: null,
},
};