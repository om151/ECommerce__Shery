# User Module API Documentation

This document provides detailed information about the API endpoints available in the User module.

## Base Path: `/user`

---

### 1. Register User

-   **Endpoint**: `/register`
-   **Method**: `POST`
-   **Description**: Registers a new user, creates their profile, and sends a verification email.
-   **Request Body**:
    ```json
    {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "password": "Password123!",
      "phone": "9876543210"
    }
    ```
-   **Validation Rules**:
    -   `name`: Minimum 2 characters.
    -   `email`: Must be a valid email format.
    -   `password`: Minimum 6 characters, must contain at least one uppercase letter, one lowercase letter, one number, and one special character.
    -   `phone`: Must be a valid mobile phone number.
-   **Success Response (201)**:
    ```json
    {
      "user": {
        "_id": "60d0fe4f5311236168a109ca",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "9876543210",
        "role": "user",
        "emailVerified": false
        // ... other user fields
      },
      "message": "Registration successful. Please verify your email.",
      "verificationLink": "http://<frontend-url>/user/verify-email?token=<token>" // NOT FOR PRODUCTION
    }
    ```
-   **Error Responses**:
    -   `400 Bad Request`: If validation fails or if the email/phone is already in use.
      ```json
      { "errors": [{ "msg": "Invalid Email", ... }] }
      ```
      ```json
      { "message": "User already exists" }
      ```
    -   `500 Internal Server Error`: For any server-side issues.

---

### 2. Login User

-   **Endpoint**: `/login`
-   **Method**: `POST`
-   **Description**: Authenticates a user and returns a JWT token. The token is also set as an `httpOnly` cookie.
-   **Request Body**:
    ```json
    {
      "email": "john.doe@example.com",
      "password": "Password123!"
    }
    ```
-   **Success Response (200)**:
    ```json
    {
      "user": {
        "_id": "60d0fe4f5311236168a109ca",
        "name": "John Doe",
        "email": "john.doe@example.com"
        // ... other user fields
      },
      "token": "jwt.token.string"
    }
    ```
-   **Error Responses**:
    -   `401 Unauthorized`: Invalid credentials.
    -   `403 Forbidden`: Account is locked or email is not verified.
    -   `400 Bad Request`: Validation errors.

---

### 3. Get User Profile

-   **Endpoint**: `/profile`
-   **Method**: `GET`
-   **Description**: Retrieves the profile of the currently authenticated user.
-   **Request Headers**:
    -   `Authorization`: `Bearer <jwt-token>`
-   **Success Response (200)**:
    ```json
    {
      "user": {
        "_id": "60d0fe4f5311236168a109ca",
        "name": "John Doe",
        "email": "john.doe@example.com"
        // ... other user fields
      }
    }
    ```
-   **Error Responses**:
    -   `401 Unauthorized`: If the token is missing or invalid.
    -   `500 Internal Server Error`: If the user cannot be found.

---

### 4. Logout User

-   **Endpoint**: `/logout`
-   **Method**: `POST`
-   **Description**: Logs out the user by clearing the session cookie and blacklisting the JWT token.
-   **Request Headers**:
    -   `Authorization`: `Bearer <jwt-token>`
-   **Success Response (200)**:
    ```json
    {
      "message": "Logged out successfully"
    }
    ```
-   **Error Responses**:
    -   `401 Unauthorized`: If the token is missing or invalid.

---

### 5. Forgot Password

-   **Endpoint**: `/forgot-password`
-   **Method**: `POST`
-   **Description**: Initiates the password reset process by sending a reset link to the user's email.
-   **Request Body**:
    ```json
    {
      "email": "john.doe@example.com"
    }
    ```
-   **Success Response (200)**:
    ```json
    {
      "message": "If this email exists, a reset link has been sent.",
      "resetLink": "http://<frontend-url>/user/reset-password?token=<token>" // NOT FOR PRODUCTION
    }
    ```
-   **Error Responses**:
    -   `403 Forbidden`: If the user has exceeded rate limits for password reset requests.
    -   `500 Internal Server Error`: For any server-side issues.

---

### 6. Reset Password

-   **Endpoint**: `/reset-password`
-   **Method**: `POST`
-   **Description**: Resets the user's password using a token from the password reset email.
-   **Query Parameters**:
    -   `token`: The password reset token.
-   **Request Body**:
    ```json
    {
      "newPassword": "NewSecurePassword123!"
    }
    ```
-   **Success Response (200)**:
    ```json
    {
      "message": "Password reset successful"
    }
    ```
-   **Error Responses**:
    -   `400 Bad Request`: If the token is invalid, expired, or the new password is weak.
    -   `500 Internal Server Error`: For any server-side issues.

---

### 7. Verify Email

-   **Endpoint**: `/verify-email`
-   **Method**: `GET`
-   **Description**: Verifies a user's email address using the token sent during registration.
-   **Query Parameters**:
    -   `token`: The email verification token.
-   **Success Response (200)**:
    ```json
    {
      "message": "Email verified successfully."
    }
    ```
-   **Error Responses**:
    -   `400 Bad Request`: If the token is invalid or expired.
    -   `500 Internal Server Error`: For any server-side issues.

---

### 8. Resend Verification Email

-   **Endpoint**: `/resend-verification-email`
-   **Method**: `GET`
-   **Description**: Resends the email verification link to the user.
-   **Query Parameters**:
    -   `mail`: The user's email address.
-   **Success Response (200)**:
    ```json
    {
      "message": "Verification email sent.",
      "verificationLink": "http://<frontend-url>/user/verify-email?token=<token>" // NOT FOR PRODUCTION
    }
    ```
-   **Error Responses**:
    -   `400 Bad Request`: If the email is already verified or a verification email was sent recently.
    -   `404 Not Found`: If the user with the specified email does not exist.
    -   `500 Internal Server Error`: For any server-side issues.