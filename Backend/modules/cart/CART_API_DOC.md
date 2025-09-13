# Cart API Endpoints Documentation

## Base Route

All routes are prefixed with `/cart` (or as configured in your main router).


## Cart Endpoints

### 1. Add Product to Cart

- **URL:** `/add`
- **Method:** `POST`
- **Body:**

```json
{
  "productId": "<productId>",
  "variantId": "<variantId>",
  "quantity": 2
}
```

- **Headers:**
  - Requires authentication (user info from token, e.g., `req.user._id`)
- **Response:** `200 OK`

```json
{
  "message": "Product added to cart",
  "cart": {
    /* cart object */
  }
}
```

---

### 2. Edit Product Quantity in Cart

- **URL:** `/edit`
- **Method:** `PUT`
- **Body:**

```json
{
  "productId": "<productId>",
  "variantId": "<variantId>",
  "quantity": 5
}
```

- **Headers:**
  - Requires authentication
- **Response:** `200 OK`

```json
{
  "message": "Cart updated",
  "cart": {
    /* cart object */
  }
}
```

---

### 3. Remove Product from Cart

- **URL:** `/remove`
- **Method:** `POST`
- **Body:**

```json
{
  "productId": "<productId>",
  "variantId": "<variantId>"
}
```

- **Headers:**
  - Requires authentication
- **Response:** `200 OK`

```json
{
  "message": "Product removed from cart",
  "cart": {
    /* cart object */
  }
}
```

---

### 4. Get Cart

- **URL:** `/`
- **Method:** `GET`
- **Headers:**
  - Requires authentication
- **Response:** `200 OK`

```json
{
  "cart": {
    /* cart object */
  }
}
```

---

## Notes

- All endpoints expect and return JSON.
- Replace `<productId>` and `<variantId>` with actual ObjectIds from your database.
- User ID is taken from the authenticated user (e.g., `req.user._id`).
- Validation errors return `400` with details.
- Adding the same product/variant updates the quantity, not the cart item.
- Only variants belonging to the specified product can be added.
