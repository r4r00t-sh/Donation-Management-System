# Donation Management System

## Overview
A full-featured, production-ready donation and receipt management system for Santhigiri Ashram. Built with a React frontend and Node.js/Express/MySQL backend, supporting multi-user roles, global theming, custom fields, ticket/support system, Razorpay payment integration, and backup/restore.

---

## Features
- **Multi-user roles:** Admin, Staff, Public
- **Receipts:** CRUD, auto-numbering, QR code, bulk delete
- **Donations:** Razorpay payment integration
- **Theming:** Global, admin-controlled, theme manager
- **Custom Fields:** Dynamic fields for receipts
- **Tickets:** Support (public), staff tickets
- **User Management:** Admin can manage users and roles
- **Reports & Analytics:** Filters, summary cards, charts
- **Backup/Restore:** Full data export/import
- **Security:** JWT auth, role-based access, best-practice headers
- **Responsive UI:** Mobile, tablet, desktop

---

## Architecture

```mermaid
flowchart LR
    %% High-level Application Flow

    %% ==== CLIENT ====
    subgraph CLIENT["Frontend (React)"]
        direction TB
        C1[User Admin / Staff / Public]
        C2[Login & Register]
        C3[Receipts, Reports, Donations, Tickets, Settings]
    end

    %% ==== BACKEND ====
    subgraph BACKEND["Backend (Node.js + Express)"]
        direction TB
        B1[Auth & Role Middleware]
        B2[Controllers: Receipts / Reports / Users / Settings / Tickets / Payment / QR]
    end

    %% ==== DATA ====
    subgraph DATA["MySQL Database"]
        direction TB
        D1[(Users)]
        D2[(Receipts)]
        D3[(Tickets)]
        D4[(Themes & Custom Fields)]
        D5[(Payment Config & Backups)]
    end

    %% ==== PAYMENT ====
    subgraph PAYMENT["Razorpay Gateway"]
        P1[Razorpay API]
    end

    %% ==== FLOW CONNECTIONS ====
    C1 --> C2 --> B1 --> D1
    C1 --> C3 --> B2
    B2 --> D2
    B2 --> D3
    B2 --> D4
    B2 --> D5
    B2 --> P1


```

---

## Upcoming Features (Unified Booking/Receipts, Family, Branch, Booking Type)

- **Unified Booking/Receipts:** Online (booking) and offline (receipts) will use the same form and data structure, with payment method as a field.
- **Family Member Management:**
  - Users can add family members (name, star, etc.) during registration or profile update.
  - Family members are linked to the main user and selectable in booking/receipt forms.
  - Staff can fetch user/family details for offline receipts.
  - When registering, users can link to an existing family.
- **Branch Field:**
  - Branch is a dropdown in booking/receipt forms.
  - Branches are managed by admin in the admin panel.
- **Type of Booking Field:**
  - Type of Booking is a dropdown in booking/receipt forms.
  - Booking types are managed by admin in the admin panel.

### Updated Database Structure

```mermaid
erDiagram
  USERS {
    string id PK
    string username
    string password_hash
    string role
    string name
    string phone
    string email
    string address
    string family_id FK
    string star
    datetime created_at
  }
  FAMILIES {
    string id PK
    string family_name
    string primary_user_id FK
    datetime created_at
  }
  RECEIPTS {
    string id PK
    string receipt_number
    string donor_name
    float amount
    date date
    string payment_method
    string remarks
    string payment_status
    string qr_code_data
    string customFields
    string user_id FK
    string family_member_id FK
    string branch_id FK
    string booking_type_id FK
    date dob
    string star
    datetime created_at
  }
  BRANCHES {
    string id PK
    string name
    datetime created_at
  }
  BOOKING_TYPES {
    string id PK
    string name
    datetime created_at
  }
  THEMES {
    string id PK
    string name
    string primary_color
    string accent_color
    string pink_color
    string light_color
    boolean is_active
    datetime created_at
  }
  CUSTOM_FIELDS {
    string id PK
    string label
    string type
    boolean required
    string options
    datetime created_at
  }
  TICKETS {
    string id PK
    string type
    string subject
    string description
    string status
    string created_by FK
    datetime created_at
  }
  PAYMENT_CONFIG {
    string id PK
    string gateway
    string key_id
    string key_secret
    boolean enabled
    datetime created_at
  }
  USERS ||--o{ RECEIPTS : "has many"
  USERS ||--o{ TICKETS : "creates"
  USERS ||--o{ FAMILIES : "belongs to family"
  FAMILIES ||--o{ USERS : "has members"
  RECEIPTS }o--|| USERS : "created by"
  RECEIPTS }o--|| FAMILIES : "for family member"
  RECEIPTS }o--|| BRANCHES : "at branch"
  RECEIPTS }o--|| BOOKING_TYPES : "of type"
  TICKETS }o--|| USERS : "created by"
```

---

## Setup & Installation

1. **Clone the repo:**
   ```sh
   git clone <repo-url>
   cd donation-management-ts
   ```
2. **Install dependencies:**
   ```sh
   npm install
   cd backend && npm install
   ```
3. **Configure environment:**
   - Create `.env` files in both root and backend with DB, JWT, and Razorpay keys.
   - In frontend `.env`:
     ```
     REACT_APP_API_BASE_URL=http://localhost:4000
     GENERATE_SOURCEMAP=false
     ```
4. **Setup MySQL database:**
   - Import provided SQL schema.
   - Update DB credentials in backend `.env`.
5. **Run backend:**
   ```sh
   cd backend
   node server.js
   ```
6. **Run frontend:**
   ```sh
   npm start
   ```

---

## Usage
- **Admin:** Full access to all features, user/theme/payment config, backup/restore.
- **Staff:** Access to receipts, tickets, reports.
- **Public:** Can register, login, donate, and raise support tickets.
- **All actions are role-protected and require JWT authentication.**

---

## Security
- JWT-based authentication, role-based access control
- Helmet for HTTP security headers
- Source maps disabled in production
- No secrets in frontend
- CORS, CSP, and best-practice headers enabled
- Regular `npm audit` and dependency updates recommended

---

## Contribution
- Fork the repo, create a branch, submit a pull request.
- Please follow code style and add tests for new features.

---

## License
MIT
