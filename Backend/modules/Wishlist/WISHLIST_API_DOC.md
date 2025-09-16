# Wishlist API Endpoints Documentation

## Base Route

All routes are prefixed with `/wishlist` (or as configured in your main router).

## Wishlist Endpoints

### 0. Get My Wishlist

- URL: `/`
- Method: `GET`
- Headers:
  - Requires authentication (Bearer token)
- Description: Returns the authenticated user's wishlist with product and variant details. Soft-deleted products/variants are excluded.
- Response: `200 OK`

```json
{
  "success": true,
  "wishlist": {
    "_id": "<wishlistId>",
    "userId": "<userId>",
    "products": [
      {
        "addedAt": "2025-09-16T12:00:00.000Z",
        "product": {
          "_id": "<productId>",
          "title": "...",
          "description": "...",
          "categories": ["..."],
          "attributes": { "brand": "..." },
          "rating": 0,
          "variants": [
            {
              "_id": "<variantId>",
              "name": "...",
              "attributes": { "color": "...", "size": "..." },
              "price": 0,
              "compareAtPrice": 0,
              "images": ["..."]
            }
          ]
        }
      }
    ]
  }
}
```

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
