# Orders Module API Documentation

This document describes the endpoints for creating and managing orders.

## Base Path: `/order`

---

### 1. Create Order

- Endpoint: `/create`
- Method: `POST`
- Auth: Required (Bearer token)
- Description: Creates a new order for the authenticated user. Validates that shipping/billing addresses belong to the user, persists item snapshots, and computes totals.
- Request Body (example):
  {
  "items": [
  {
  "productId": "64f123abc0d12a3456789ef0",
  "variantId": "64f123abc0d12a3456789ef9",
  "title": "Product title",
  "variantName": "Color: Red, Size: M",
  "quantity": 2,
  "unitPrice": 499,
  "totalPrice": 998
  }
  ],
  "currency": "INR",
  "shippingAddress": "64f123abc0d12a3456789aaa",
  "billingAddress": "64f123abc0d12a3456789aab",
  "couponId": "64f123abc0d12a3456789aac",
  "shippingFee": 0,
  "tax": 0,
  "orderDiscount": 0,
  "notes": "Leave at the door"
  }
- Validation Rules:
  - `items`: array with at least one item
  - `items.*.productId`: valid MongoId
  - `items.*.title`: non-empty string
  - `items.*.quantity`: integer ≥ 1
  - `items.*.unitPrice`: number ≥ 0
  - `items.*.variantId`: optional MongoId
  - `currency`: optional, one of `INR`, `USD`
  - `shippingAddress`: valid MongoId (must belong to user)
  - `billingAddress`: optional MongoId (if omitted, shippingAddress is used)
  - `couponId`: optional MongoId
  - `shippingFee`, `tax`, `orderDiscount`: optional numbers ≥ 0
  - `notes`: optional string
- Success Response (201):
  {
  "order": {
  "\_id": "66a1b2c3d4e5f6a7b8c9d0e1",
  "orderNumber": "20250915-ABC123",
  "userId": "60d0fe4f5311236168a109ca",
  "items": ["66a1..."],
  "currency": "INR",
  "itemsSubtotal": 998,
  "grandTotal": 998,
  "status": "pending",
  "paymentStatus": "unpaid"
  }
  }
- Error Responses:
  - 400 Bad Request: Validation errors, invalid shipping/billing address
  - 401 Unauthorized: Missing/invalid token
  - 500 Internal Server Error

---

### 2. Update Shipping Address

- Endpoint: `/:orderId/shipping-address`
- Method: `PUT`
- Auth: Required (Bearer token)
- Description: Updates the shipping address for an order if it’s not shipped, delivered, cancelled, or returned. Address must belong to the user.
- Path Params:
  - `orderId`: Order document id
- Request Body:
  {
  "shippingAddress": "64f123abc0d12a3456789aaa"
  }
- Validation Rules:
  - `orderId`: valid MongoId
  - `shippingAddress`: valid MongoId (must belong to user)
- Success Response (200):
  {
  "order": { "\_id": "...", "shippingAddress": "..." },
  "message": "Shipping address updated"
  }
- Error Responses:
  - 400 Bad Request: Validation errors or order locked due to status
  - 401 Unauthorized: Missing/invalid token
  - 403 Forbidden: Order does not belong to user
  - 404 Not Found: Order not found

---

### 3. Cancel Order

- Endpoint: `/:orderId/cancel`
- Method: `PUT`
- Auth: Required (Bearer token)
- Description: Cancels an order if it’s not already shipped, delivered, or returned. No-op if already cancelled.
- Path Params:
  - `orderId`: Order document id
- Success Response (200):
  {
  "order": { "\_id": "...", "status": "cancelled" },
  "message": "Order cancelled"
  }
- Error Responses:
  - 400 Bad Request: Order locked due to status
  - 401 Unauthorized: Missing/invalid token
  - 403 Forbidden: Order does not belong to user
  - 404 Not Found: Order not found

---

### 4. List Orders

- Endpoint: `/`
- Method: `GET`
- Auth: Required (Bearer token)
- Description: Returns paginated list of orders for the authenticated user. Populates order items.
- Query Params:
  - `page` (optional): default 1
  - `limit` (optional): default 10, max 50
- Success Response (200):
  {
  "orders": [ { /* order */ } ],
  "page": 1,
  "limit": 10,
  "total": 23,
  "pages": 3
  }
- Error Responses:
  - 401 Unauthorized: Missing/invalid token
  - 500 Internal Server Error

---

### 5. Admin: List All Orders

- Endpoint: `/admin/all`
- Method: `GET`
- Auth: Required (Bearer token, admin only)
- Description: Returns a paginated list of all orders across users. Populates order items.
- Query Params:
  - `page` (optional): default 1
  - `limit` (optional): default 10, max 100
- Success Response (200):
  {
  "orders": [ { /* order */ } ],
  "page": 1,
  "limit": 10,
  "total": 230,
  "pages": 23
  }
- Error Responses:
  - 401 Unauthorized: Missing/invalid token
  - 403 Forbidden: Access denied. Admins only.
  - 500 Internal Server Error

---

### Notes

- Monetary totals are computed from item snapshots and optional fees/discounts.
- Address ownership is enforced.
- Status transitions lock certain operations (e.g., shipping address update after ship/deliver/cancel/return, cancellation after shipped/delivered/returned).
- For payments, refer to the Payment module (`/payment`).
