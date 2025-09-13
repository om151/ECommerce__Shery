# Coupon API Endpoints Documentation



## Base Route

All routes are prefixed with `/coupon` (or as configured in your main router).

## Coupon Endpoints

### 1. Create Coupon

- **URL:** `/create`
- **Method:** `POST`
- **Body:**

```json
{
  "code": "WELCOME10",
  "name": "Welcome 10% Off",
  "description": "10% off for new users",
  "discountType": "percentage", // ["percentage", "fixed", "free_shipping"]
  "maxDiscount": 100,
  "minOrderValue": 500,
  "usageLimit": 50,
  "validFrom": "2025-09-01T00:00:00.000Z",
  "validTo": "2025-12-31T23:59:59.999Z",
  "isActive": true
}
```

- **Response:** `201 Created`

---

### 2. Edit Coupon

- **URL:** `/:couponId`
- **Method:** `PUT`
- **Body:** (any updatable fields)

```json
{
  "name": "Welcome 15% Off",
  "description": "15% off for new users",
  "discountType": "percentage",
  "maxDiscount": 150,
  "minOrderValue": 700,
  "usageLimit": 100,
  "validTo": "2026-01-31T23:59:59.999Z"
}
```

- **Response:** `200 OK`

---

### 3. Soft Delete Coupon

- **URL:** `/:couponId`
- **Method:** `DELETE`
- **Response:** `200 OK`

---

## Coupon Usage Endpoints

### 4. Create Coupon Usage

- **URL:** `/coupon-usages`
- **Method:** `POST`
- **Body:**

```json
{
  "couponId": "<couponId>",
  "userId": "<userId>",
  "discountAmount": 50,
  "orderId": "<orderId>" // optional
}
```

- **Response:** `201 Created`

---

## Notes

- All endpoints expect and return JSON.
- Replace `<couponId>`, `<userId>`, and `<orderId>` with actual MongoDB ObjectIds.
- Validation errors return `400` with details.
- Coupon creation and usage require valid, active coupon and user IDs.
