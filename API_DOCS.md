# API Documentation

This document describes all backend API endpoints for the Santhigiri Ashram Donation Management System.

---

## Authentication
- All endpoints (except login/register/health) require a JWT in the `Authorization: Bearer <token>` header.
- Role-based access: `admin`, `staff`, `public`.

---

## Auth

### Register
- **POST** `/api/auth/register`
- **Description:** Register a new public user
- **Body:**
  ```json
  {
    "name": "string",
    "phone": "string",
    "email": "string",
    "address": "string",
    "password": "string"
  }
  ```
- **Response:** `{ token, user }`
- **Auth:** Public

### Login
- **POST** `/api/auth/login`
- **Description:** Login with email and password
- **Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:** `{ token, user }`
- **Auth:** Public

### Health Check
- **GET** `/api/health`
- **Description:** Check server/database status
- **Auth:** None

---

## Users (Admin only)

### List Users
- **GET** `/api/users`
- **Description:** List all users
- **Auth:** Admin

### Add User
- **POST** `/api/users`
- **Body:** `{ username, password, role }`
- **Auth:** Admin

### Edit User
- **PUT** `/api/users/:id`
- **Body:** `{ username, role }`
- **Auth:** Admin

### Delete User
- **DELETE** `/api/users/:id`
- **Auth:** Admin

---

## Receipts

### List Receipts
- **GET** `/api/receipts`
- **Description:** List all receipts (admin/staff)
- **Auth:** Admin, Staff

### Add Receipt
- **POST** `/api/receipts`
- **Body:**
  ```json
  {
    "donor_name": "string",
    "amount": number,
    "date": "YYYY-MM-DD",
    "payment_method": "string",
    "remarks": "string",
    "payment_status": "paid|pending",
    "qr_code_data": "string",
    "customFields": { ... },
    "dob": "YYYY-MM-DD",
    "star": "string"
  }
  ```
- **Auth:** Admin, Staff

### Edit Receipt
- **PUT** `/api/receipts/:id`
- **Body:** (same as add)
- **Auth:** Admin, Staff

### Delete Receipt
- **DELETE** `/api/receipts/:id`
- **Auth:** Admin

### Bulk Delete
- **POST** `/api/receipts/bulk-delete`
- **Body:** `{ ids: ["id1", "id2", ...] }`
- **Auth:** Admin

---

## Reports

### Get Reports
- **GET** `/api/reports`
- **Description:** Get analytics/summary data
- **Auth:** Admin, Staff

---      

## Themes

### List Themes
- **GET** `/api/themes`
- **Auth:** Admin

### Get Active Theme
- **GET** `/api/theme`
- **Auth:** Any

### Add Theme
- **POST** `/api/theme`
- **Body:** `{ name, primary_color, accent_color, pink_color, light_color }`
- **Auth:** Admin

### Activate Theme
- **POST** `/api/theme/activate`
- **Body:** `{ id }`
- **Auth:** Admin

### Delete Theme
- **DELETE** `/api/theme/:id`
- **Auth:** Admin

---

## Custom Fields

### List Custom Fields
- **GET** `/api/custom-fields`
- **Auth:** Admin

### Add Custom Field
- **POST** `/api/custom-fields`
- **Body:** `{ label, type, required, options }`
- **Auth:** Admin

### Delete Custom Field
- **DELETE** `/api/custom-fields/:id`
- **Auth:** Admin

---

## Tickets

### List Tickets
- **GET** `/api/tickets`
- **Auth:** Admin, Staff, Public (own)

### Add Ticket
- **POST** `/api/tickets`
- **Body:** `{ type: "support|staff", subject, description }`
- **Auth:** Public, Staff

### View Ticket
- **GET** `/api/tickets/:id`
- **Auth:** Owner, Admin, Staff

### Add Ticket Message
- **POST** `/api/tickets/:id/messages`
- **Body:** `{ message }`
- **Auth:** Owner, Admin, Staff

### Update Ticket Status
- **PUT** `/api/tickets/:id`
- **Body:** `{ status }`
- **Auth:** Admin, Staff

---

## Payment (Razorpay)

### Get Payment Config
- **GET** `/api/payment/config`
- **Auth:** Admin

### Update Payment Config
- **POST** `/api/payment/config`
- **Body:** `{ gateway, key_id, key_secret, enabled }`
- **Auth:** Admin

### Create Razorpay Order
- **POST** `/api/payment/razorpay/order`
- **Body:** `{ amount, currency, receipt }`
- **Auth:** Public, Staff, Admin

### Verify Razorpay Payment
- **POST** `/api/payment/razorpay/verify`
- **Body:** `{ order_id, payment_id, signature }`
- **Auth:** Public, Staff, Admin

---

## Backup/Restore

### Export Data
- **GET** `/api/backup/export`
- **Auth:** Admin

### Import Data
- **POST** `/api/backup/import`
- **Body:** (full data JSON)
- **Auth:** Admin

---

## Example: Authenticated Request
```http
GET /api/receipts HTTP/1.1
Host: localhost:4000
Authorization: Bearer <jwt-token>
```

---

## Notes
- All endpoints return JSON.
- Errors are returned as `{ error: "message" }`.
- All date fields use ISO format (YYYY-MM-DD).
- All sensitive actions are role-protected. 