# E-Commerce Database Design Documentation

## Overview

This document describes the MongoDB schema design for the E-Commerce backend. The system supports users, products (with variants and inventory), carts, orders, reviews, and authentication features.

---

## 1. User

The `users` collection stores all registered users. Each user document contains:

- `email` (String): The user's unique email address (required, validated).
- `password` (String): The hashed password (required, not selected by default for security).
- `name` (String): The user's full name (required, with length constraints).
- `phone` (String): Unique 10-digit phone number (required).
- `role` (String): User's role, either 'user' or 'admin' (default: 'user').
- `addresses` (Array of Objects): Each address object contains:
  - `label` (String)
  - `line1` (String)
  - `line2` (String, optional)
  - `city` (String)
  - `state` (String)
  - `postalCode` (Number)
  - `country` (String)
- `wishlistItems` (Array of Objects): Each with:
  - `productId` (ObjectId, ref: Product)
  - `addedAt` (Date)
- `orderHistory` (Array of Objects): Each with:
  - `orderId` (ObjectId, ref: Order)
  - `orderedAt` (Date)
- `isActive` (Boolean): Indicates if the account is active.
- `failedLoginAttempts` (Number): Number of failed login attempts.
- `lockUntil` (Date): Account lockout expiry.
- `resetPasswordToken` (String): For password reset.
- `resetPasswordExpires` (Date): Expiry for reset token.
- `lastPasswordResetDone` (Date): Last reset date.
- `lastPasswordResetRequest` (Date): Last reset request date.
- `emailVerified` (Boolean): Email verification status.
- `emailVerificationToken` (String): For email verification.
- `emailVerificationExpires` (Date): Expiry for verification token.
- `resetRequestCount` (Number): Rate limiting for reset requests.
- `resetRequestDate` (Date): Date of last reset request.
- `createdAt`, `updatedAt` (Date): Automatic timestamps.

---

## 2. Product

The `products` collection contains all products available in the store. Each product document includes:

- `title` (String): The product's name (required).
- `description` (String): Detailed description of the product (required).
- `categories` (Array of String): Categories the product belongs to.
- `attributes` (Object): Contains brand and other product-specific attributes.
- `variants` (Array of ObjectId, ref: ProductVariant): Different versions (e.g., color, size) of the product.
- `searchKeywords` (Array of String): Keywords to improve searchability.
- `rating` (Number): Average product rating.
- `reviews` (Array of ObjectId, ref: Review): Product reviews.
- `createdAt`, `updatedAt` (Date): Automatic timestamps.

### ProductVariant

The `productvariants` collection stores variant details for products. Each variant includes:

- `name` (String): Name of the variant (e.g., "Red, Large").
- `attributes` (Object): Variant-specific attributes like color and size.
- `price` (Number): Price for this variant.
- `compareAtPrice` (Number): Original price for comparison (for discounts).
- `images` (Array of String): Image URLs for the variant.
- `inventoryId` (String): Reference to the inventory record for this variant.

---

## 3. Inventory

The `inventories` collection tracks stock levels for each product variant. Each inventory document contains:

- `productId` (ObjectId, ref: Product): Reference to the associated product.
- `variantId` (ObjectId, ref: ProductVariant): Reference to the associated product variant.
- `reservedQuantity` (Number): Quantity reserved (e.g., in active carts).
- `quantityAvailable` (Number): Quantity available for sale.

---

## 4. Cart

The `carts` collection represents shopping carts for users. Each cart document includes:

- `userId` (ObjectId, ref: User): Reference to the user who owns the cart.
- `items` (Array of Objects): Embedded cart items. Each item contains:
  - `productId` (ObjectId, ref: Product): Reference to the product.
  - `variantId` (ObjectId, ref: ProductVariant): Reference to the product variant.
  - `quantity` (Number): Number of units for this item.
  - `unitPrice` (Number): Price per unit at the time of adding to cart.
  - `totalPrice` (Number): Total price for this item (unitPrice \* quantity).
- `total` (Number): Total value of the cart.
- `currency` (String): Currency code (default: INR).
- `expiresAt` (Date): Date when the cart expires (auto-deleted after 1 day).
- `createdAt`, `updatedAt` (Date): Automatic timestamps.

---

## 5. Review

The `reviews` collection stores product reviews submitted by users. Each review document contains:

- `productId` (ObjectId, ref: Product): Reference to the reviewed product.
- `userId` (ObjectId, ref: User): Reference to the user who wrote the review.
- `orderId` (ObjectId, ref: Order): Reference to the order associated with the review.
- `rating` (Number): Numeric rating (1-5).
- `title` (String): Title of the review.
- `comment` (String): Review text.
- `createdAt` (Date): Timestamp of when the review was created.

---

## 6. BlacklistToken

The `blacklisttokens` collection is used for authentication and session management. Each document contains:

- `token` (String): The JWT or session token that has been blacklisted.
- `blacklistedAt` (Date): Date when the token was blacklisted (auto-expires after 24 hours).

---

## Relationships

- A user can have multiple carts, orders, reviews, and wishlist items.
- Each product can have multiple variants and reviews.
- Each product variant is linked to an inventory record.
- A cart contains multiple cart items, each referencing a product and a product variant.
- Each review references a user, a product, and an order.
- BlacklistToken is used to manage invalidated authentication tokens.

---

## Notes

- All schemas use Mongoose's built-in timestamps for `createdAt` and `updatedAt`.
- Sensitive fields such as passwords and tokens are not selected by default for security.
- Expiry fields (such as for carts and tokens) use MongoDB's TTL index for automatic cleanup.
- The design is extensible for future features like order management, payment, and shipping.

---

This documentation provides a clear, narrative overview of your MongoDB schema and relationships for your e-commerce backend. Edit or extend as needed for your project.
