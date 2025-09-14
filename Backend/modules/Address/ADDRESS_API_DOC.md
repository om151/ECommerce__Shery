# Address Routes Documentation

Base Path: `/address`
Authentication: Required (JWT in `Authorization: Bearer <token>` header or `token` cookie per existing auth middleware).
Content-Type: `application/json` for all write operations.

## Uniqueness Rule

A user cannot store two addresses with the exact same combination of: `line1`, `line2` (empty if not provided), `city`, `state`, `postalCode`, `country`.
If violated, response: `409 Conflict { "message": "Address already exists" }`.

---

## 1. Create Address

POST `/address`

Request Body Example:

```json
{
  "label": "Home",
  "line1": "123 Test Street",
  "line2": "Apt 4B",
  "city": "Testville",
  "state": "TX",
  "postalCode": "123456",
  "country": "USA"
}
```

Success (201):

```json
{
  "message": "Address created",
  "address": {
    "_id": "...",
    "label": "Home",
    "line1": "123 Test Street",
    "line2": "Apt 4B",
    "city": "Testville",
    "state": "TX",
    "postalCode": "123456",
    "country": "USA",
    "userId": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

Validation Errors (400):

```json
{
  "errors": [{ "msg": "postalCode must be 6 characters", "path": "postalCode" }]
}
```

Duplicate (409):

```json
{ "message": "Address already exists" }
```

---

## 2. List Addresses

GET `/address`

Success (200):

```json
{ "addresses": [ { "_id": "...", "label": "Home", ... }, { "_id": "...", "label": "Office", ... } ] }
```

Notes: Returns only the requesting user's addresses. Sorted newest first.

---

## 3. Get Single Address

GET `/address/:id`

Success (200):

```json
{ "address": { "_id": "...", "label": "Home", ... } }
```

Not Found / Not Owned (404):

```json
{ "message": "Address not found" }
```

Invalid ID (400):

```json
{ "errors": [{ "msg": "Valid address id required", "path": "id" }] }
```

---

## 4. Update Address

PUT `/address/:id`
Body: Any subset of creatable fields (same validation; all optional). Example:

```json
{ "label": "Primary Home" }
```

Success (200):

```json
{ "message": "Address updated", "address": { "_id": "...", "label": "Primary Home", ... } }
```

Not Found / Not Owned (404): same as above.
Duplicate (409) if the update causes collision with another existing address of same user.

---

## 5. Delete Address

DELETE `/address/:id`

Success (200):

```json
{ "message": "Address deleted" }
```

Not Found (404):

```json
{ "message": "Address not found" }
```

---

## Error Summary

| Status | When                                   | Shape                                                                              |
| ------ | -------------------------------------- | ---------------------------------------------------------------------------------- |
| 400    | Validation failure (express-validator) | `{ errors: [...] }`                                                                |
| 401    | Missing/invalid auth                   | `{ message: "No token, authorization denied" }` or `{ message: "User not found" }` |
| 404    | Address not owned or not found         | `{ message: "Address not found" }`                                                 |
| 409    | Duplicate address                      | `{ message: "Address already exists" }`                                            |
| 500    | Unexpected server error                | `{ message: "Server error" }`                                                      |

---



