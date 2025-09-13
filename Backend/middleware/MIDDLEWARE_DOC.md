# Middleware Documentation

This document describes the middleware available in the `Backend/middleware` directory.

---

## 1. `auth.middleware.js`

**Purpose:**

- Authenticates requests using JWT or session.
- Attaches the authenticated user to `req.user` if valid.
- Rejects requests with invalid or missing tokens.

**Typical Usage:**

```js
const authMiddleware = require("../middleware/auth.middleware");
router.get("/protected", authMiddleware, (req, res) => { ... });
```

---

## 2. `adminAuth.middleware.js`

**Purpose:**

- Ensures the authenticated user has admin privileges.
- Should be used after `auth.middleware.js`.
- Rejects requests if `req.user.role !== 'admin'`.

**Typical Usage:**

```js
const adminAuthMiddleware = require("../middleware/adminAuth.middleware");
router.post("/admin-only", authMiddleware, adminAuthMiddleware, (req, res) => { ... });
```

---

## 3. `upload.js`

**Purpose:**

- Handles file uploads (e.g., images) using Multer or similar.
- Configures storage, file size limits, and accepted file types.
- Attaches uploaded files to `req.file` or `req.files`.

**Typical Usage:**

```js
const upload = require("../middleware/upload");
router.post("/upload", upload.single("image"), (req, res) => { ... });
```

---

## Notes

- Middleware should be used in the correct order (e.g., authentication before admin check).
- Always validate and sanitize uploaded files.
- Customize middleware as needed for your application's security and business logic.
