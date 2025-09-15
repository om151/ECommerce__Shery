# Review Module API Documentation

This document describes the endpoints to create, update, and delete product reviews.

## Base Path: `/review`

---

### 1. Create Review

- Endpoint: `/`
- Method: `POST`
- Auth: Required (Bearer token)
- Description: Creates a review for a product that the authenticated user has ordered.
- Request Body:
  {
  "productId": "64f123abc0d12a3456789ef0",
  "orderId": "64f123abc0d12a3456789ef1",
  "rating": 5,
  "title": "Great product!",
  "comment": "Loved the build quality and performance."
  }
- Validation Rules:
  - `productId`: required, valid MongoId
  - `orderId`: required, valid MongoId, must belong to the user
  - `rating`: required, integer 1–5
  - `title`: optional, 1–120 chars
  - `comment`: optional, 1–1000 chars
- Success Response (201):
  {
  "review": {
  "\_id": "66a1b2c3d4e5f6a7b8c9d0e1",
  "productId": "64f123abc0d12a3456789ef0",
  "orderId": "64f123abc0d12a3456789ef1",
  "userId": "60d0fe4f5311236168a109ca",
  "rating": 5,
  "title": "Great product!",
  "comment": "Loved the build quality and performance.",
  "createdAt": "2025-09-15T10:00:00.000Z"
  },
  "message": "Review created"
  }
- Error Responses:
  - 400 Bad Request: Validation errors or duplicate review by same user for the same product+order.
  - 401 Unauthorized: Missing/invalid token.
  - 403 Forbidden: Order doesn’t belong to the user.
  - 404 Not Found: Order not found.

---

### 2. Update Review

- Endpoint: `/:reviewId`
- Method: `PUT`
- Auth: Required (Bearer token)
- Description: Updates a review created by the authenticated user. Only `rating`, `title`, and `comment` can be updated.
- Path Params:
  - `reviewId`: Review document id
- Request Body:
  {
  "rating": 4,
  "title": "Still good",
  "comment": "After a week, I'm satisfied."
  }
- Validation Rules:
  - `rating`: optional, integer 1–5
  - `title`: optional, 1–120 chars
  - `comment`: optional, 1–1000 chars
- Success Response (200):
  {
  "review": {
  "\_id": "66a1b2c3d4e5f6a7b8c9d0e1",
  "rating": 4,
  "title": "Still good",
  "comment": "After a week, I'm satisfied."
  },
  "message": "Review updated"
  }
- Error Responses:
  - 400 Bad Request: Validation errors or no updatable fields provided.
  - 401 Unauthorized: Missing/invalid token.
  - 403 Forbidden: Trying to edit someone else’s review.
  - 404 Not Found: Review not found.

---

### 3. Delete Review

- Endpoint: `/:reviewId`
- Method: `DELETE`
- Auth: Required (Bearer token)
- Description: Deletes a review owned by the authenticated user.
- Path Params:
  - `reviewId`: Review document id
- Success Response (200):
  { "message": "Review deleted" }
- Error Responses:
  - 400 Bad Request: Validation errors.
  - 401 Unauthorized: Missing/invalid token.
  - 403 Forbidden: Trying to delete someone else’s review.
  - 404 Not Found: Review not found.

---

### Notes

- The order must belong to the user creating the review. The service enforces this.
- Duplicate reviews are prevented per user/product/order.
- Consider adding GET endpoints for listing reviews later (by product, by user) and an average rating update job if needed.
