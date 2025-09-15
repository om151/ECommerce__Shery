# Payment Module API Documentation

This document provides detailed information about the API endpoints available in the Payment module.

## Base Path: `/payment`

---

### 1. Process Payment

- **Endpoint**: `/process`
- **Method**: `POST`
- **Description**: Initiates payment for an order. For `cod`, creates a pending COD payment and marks the order paymentStatus as `pending`. For `card` or `upi`, creates a Razorpay order and returns details for client-side checkout.
- **Authentication**: Required (Bearer token)
- **Request Body**:
  ```json
  {
    "orderId": "64f123abc0d12a3456789ef0",
    "method": "cod" // one of: cod | card | upi
  }
  ```
- **Validation Rules**:
  - `orderId`: Must be a valid MongoId.
  - `method`: Must be one of `cod`, `card`, or `upi`.
- **Success Response (201) — COD**:
  ```json
  {
    "order": {
      "_id": "64f123abc0d12a3456789ef0",
      "paymentStatus": "pending"
      // ... other order fields
    },
    "payment": {
      "_id": "66a1b2c3d4e5f6a7b8c9d0e1",
      "orderId": "64f123abc0d12a3456789ef0",
      "userId": "60d0fe4f5311236168a109ca",
      "method": "cod",
      "provider": "cod",
      "status": "pending",
      "referenceId": "ORD-0001"
      // ... other payment fields
    },
    "message": "COD payment created"
  }
  ```
- **Success Response (201) — Card/UPI via Razorpay**:
  ```json
  {
    "razorpayOrderId": "order_N9abcXYZ123",
    "amount": 123450, // in paise
    "currency": "INR",
    "keyId": "rzp_test_XXXXXXXX",
    "order": {
      "_id": "64f123abc0d12a3456789ef0",
      "paymentStatus": "pending"
      // ... other order fields
    },
    "payment": {
      "_id": "66a1b2c3d4e5f6a7b8c9d0e1",
      "method": "card",
      "provider": "razorpay",
      "status": "pending",
      "transactionId": "order_N9abcXYZ123"
      // ... other payment fields
    },
    "message": "Razorpay order created"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Validation errors, order already paid.
  - `401 Unauthorized`: Missing or invalid token.
  - `403 Forbidden`: Order does not belong to the user.
  - `404 Not Found`: Order not found.
  - `500 Internal Server Error`: Razorpay credentials not configured or other server errors.

---

### 2. Verify Payment (Razorpay)

- **Endpoint**: `/verify`
- **Method**: `POST`
- **Description**: Verifies a completed Razorpay payment using signature verification and marks the order as `paid` upon success.
- **Authentication**: Required (Bearer token)
- **Request Body**:
  ```json
  {
    "orderId": "64f123abc0d12a3456789ef0",
    "razorpay_order_id": "order_N9abcXYZ123",
    "razorpay_payment_id": "pay_N9abcXYZ456",
    "razorpay_signature": "abcd1234ef5678..."
  }
  ```
- **Validation Rules**:
  - `orderId`: Must be a valid MongoId.
  - `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`: Non-empty strings with minimum length checks.
- **Success Response (200)**:
  ```json
  {
    "order": {
      "_id": "64f123abc0d12a3456789ef0",
      "paymentStatus": "paid"
      // ... other order fields
    },
    "payment": {
      "_id": "66a1b2c3d4e5f6a7b8c9d0e1",
      "status": "captured",
      "amountCaptured": 1234,
      "transactionId": "pay_N9abcXYZ456"
      // ... other payment fields
    },
    "message": "Payment verified and captured"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Validation errors or invalid signature.
  - `401 Unauthorized`: Missing or invalid token.
  - `403 Forbidden`: Order does not belong to the user.
  - `404 Not Found`: Pending payment not found for this order.
  - `500 Internal Server Error`: Server errors.

---

### Notes

- Razorpay amounts are in paise; `amount` in the response for creation reflects this.
- Environment variables required for Razorpay:
  - `RAZORPAY_KEY_ID`
  - `RAZORPAY_KEY_SECRET`
- Orders already marked as `paid` will be rejected for re-processing.
- For COD, payment `status` remains `pending` until fulfillment; you may close it upon delivery in a separate flow.
