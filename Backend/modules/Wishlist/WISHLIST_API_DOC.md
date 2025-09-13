# Wishlist API Endpoints Documentation


## Base Route

All routes are prefixed with `/wishlist` (or as configured in your main router).

## Wishlist Endpoints

### 1. Add Product to Wishlist

- **URL:** `/add`
- **Method:** `POST`
- **Body:**

```json
{
  "productId": "<productId>"
}
```

- **Headers:**
  - Requires authentication (user info from token, e.g., `req.user._id`)
- **Response:** `200 OK`

```json
{
  "message": "Product added to wishlist",
  "wishlist": {
    /* wishlist object */
  }
}
```

---

### 2. Remove Product from Wishlist

- **URL:** `/remove`
- **Method:** `POST`
- **Body:**

```json
{
  "productId": "<productId>"
}
```

- **Headers:**
  - Requires authentication (user info from token, e.g., `req.user._id`)
- **Response:** `200 OK`

```json
{
  "message": "Product removed from wishlist",
  "wishlist": {
    /* wishlist object */
  }
}
```

---

## Notes

- All endpoints expect and return JSON.
- Replace `<productId>` with an actual Product ObjectId from your database.
- User ID is taken from the authenticated user (e.g., `req.user._id`).
- Validation errors return `400` with details.
- Duplicate products are not added; removing a non-existent product has no effect.
