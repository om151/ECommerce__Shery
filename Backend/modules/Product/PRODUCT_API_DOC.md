# Product Module API Documentation

This document provides an overview of all API endpoints available in the `Product` module.

---

## Base Route

All routes are prefixed with `/product` (or as configured in your main router).

---

## Endpoints

### 0. Get All Products (Public)

- URL: `/`
- Method: `GET`
- Middleware: None
- Description: Returns all non-deleted products with their non-deleted variants populated.
- Query Params: None
- Response: `{ success: true, count: number, products: Product[] }`

### 1. Add Product with Variants

- **URL:** `/add`
- **Method:** `POST`
- **Middleware:** `authMiddleware`, `adminAuthMiddleware`, `upload.array('images', 20)`, `parseProductFormData`, `validateProduct`
- **Description:** Adds a new product with multiple variants.
- **Body:**
  - `title` (string, required)
  - `description` (string, required)
  - `categories` (array of strings, required)
  - `attributes` (object, required, e.g., `{ brand: 'Nike' }`)
  - `searchKeywords` (array of strings, required)
  - `variants` (array of objects, required)
    - Each variant: `{ name, attributes: { color, size }, price, compareAtPrice, quantityAvailable }`
  - `images` (multipart files, optional)
- **Response:** `{ message, product }`

---

### 2. Edit Product

- **URL:** `/edit/:productId`
- **Method:** `PUT`
- **Middleware:** `authMiddleware`, `adminAuthMiddleware`, `upload.array('images', 20)`, `parseProductFormData`, `validateProductEdit`
- **Description:** Edits an existing product's details.
- **Params:**
  - `productId` (MongoDB ObjectId)
- **Body:**
  - Any updatable product fields (see model)
- **Response:** `{ message, product }`

---

### 3. Edit Variant

- **URL:** `/variant/edit/:variantId`
- **Method:** `PUT`
- **Middleware:** `authMiddleware`, `adminAuthMiddleware`, `upload.array('images', 10)`, `parseProductFormData`, `validateVariantEdit`
- **Description:** Edits an existing product variant.
- **Params:**
  - `variantId` (MongoDB ObjectId)
- **Body:**
  - Any updatable variant fields (see model)
- **Response:** `{ message, variant }`

---

### 4. Add New Variant to Product

- **URL:** `/variant/add/:productId`
- **Method:** `POST`
- **Middleware:** `authMiddleware`, `adminAuthMiddleware`, `upload.array('images', 10)`, `parseProductFormData`, `validateNewVariant`
- **Description:** Adds a new variant to an existing product.
- **Params:**
  - `productId` (MongoDB ObjectId)
- **Body:**
  - `name`, `attributes: { color, size }`, `price`, `compareAtPrice`, `quantityAvailable`
  - `images` (multipart files, optional)
- **Response:** `{ message, variant }`

---

### 5. Delete Variant from Product

- **URL:** `/variant/:variantId`
- **Method:** `DELETE`
- **Middleware:** `validateVariantId`, `authMiddleware`, `adminAuthMiddleware`
- **Description:** Soft deletes a variant and sets its inventory quantity to 0.
- **Params:**
  - `variantId` (MongoDB ObjectId)
- **Response:** `{ message }`

---

### 6. Delete Product (and all its variants, inventories, reviews)

- **URL:** `/:productId`
- **Method:** `DELETE`
- **Middleware:** `validateProductId`, `authMiddleware`, `adminAuthMiddleware`
- **Description:** Soft deletes a product, all its variants, and sets their inventories to 0.
- **Params:**
  - `productId` (MongoDB ObjectId)
- **Response:** `{ message }`

---

## Notes

- All endpoints require authentication and admin authorization unless otherwise specified.
- File uploads use `multipart/form-data`.
- Validation is handled using `express-validator`.
- Soft delete is implemented (records are not removed from DB, but marked as deleted).

---

## Models Reference

- **Product**: See `models/product.model.js`
- **ProductVariant**: See `models/product.model.js`
- **Inventory**: See `models/inventry.model.js`

---

For more details, refer to the code and validation logic in the respective files.
