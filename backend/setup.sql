CREATE DATABASE IF NOT EXISTS ashram_receipts CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ashram_receipts;

CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'staff', 'public') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE themes (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    primary_color VARCHAR(7) NOT NULL,
    accent_color VARCHAR(7) NOT NULL,
    pink_color VARCHAR(7) NOT NULL,
    light_color VARCHAR(7) NOT NULL
);

CREATE TABLE settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    active_theme_id CHAR(36),
    FOREIGN KEY (active_theme_id) REFERENCES themes(id)
);

CREATE TABLE custom_fields (
    id CHAR(36) PRIMARY KEY,
    label VARCHAR(128) NOT NULL,
    type ENUM('text', 'checkbox', 'radio', 'dropdown', 'number', 'date') NOT NULL,
    required BOOLEAN NOT NULL DEFAULT 0
);

CREATE TABLE custom_field_options (
    id CHAR(36) PRIMARY KEY,
    field_id CHAR(36) NOT NULL,
    label VARCHAR(128) NOT NULL,
    value VARCHAR(128) NOT NULL,
    FOREIGN KEY (field_id) REFERENCES custom_fields(id) ON DELETE CASCADE
);

CREATE TABLE receipts (
    id CHAR(36) PRIMARY KEY,
    receipt_number VARCHAR(32) NOT NULL,
    donor_name VARCHAR(128) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    payment_method ENUM('Cash', 'Card', 'UPI', 'Cheque') NOT NULL,
    remarks VARCHAR(255),
    created_by CHAR(36),
    payment_status ENUM('pending', 'paid', 'failed'),
    qr_code_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE receipt_custom_fields (
    id CHAR(36) PRIMARY KEY,
    receipt_id CHAR(36) NOT NULL,
    field_id CHAR(36) NOT NULL,
    value TEXT,
    FOREIGN KEY (receipt_id) REFERENCES receipts(id) ON DELETE CASCADE,
    FOREIGN KEY (field_id) REFERENCES custom_fields(id) ON DELETE CASCADE
);

CREATE TABLE tickets (
    id CHAR(36) PRIMARY KEY,
    type ENUM('staff', 'support') NOT NULL,
    created_by CHAR(36) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('open', 'in_progress', 'resolved', 'closed') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE ticket_messages (
    id CHAR(36) PRIMARY KEY,
    ticket_id CHAR(36) NOT NULL,
    sender_id CHAR(36) NOT NULL,
    sender_role ENUM('admin', 'staff', 'public') NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- Families table
CREATE TABLE families (
    id CHAR(36) PRIMARY KEY,
    primary_user_id CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (primary_user_id) REFERENCES users(id)
);

-- Branches table
CREATE TABLE branches (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(128) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Booking Types table
CREATE TABLE booking_types (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(128) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alter users table to add family_id and star
ALTER TABLE users ADD COLUMN family_id CHAR(36) NULL, ADD COLUMN star VARCHAR(32) NULL, ADD FOREIGN KEY (family_id) REFERENCES families(id);

-- Alter receipts table to add family_member_id, branch_id, booking_type_id, star
ALTER TABLE receipts 
    ADD COLUMN family_member_id CHAR(36) NULL,
    ADD COLUMN branch_id CHAR(36) NULL,
    ADD COLUMN booking_type_id CHAR(36) NULL,
    ADD COLUMN star VARCHAR(32) NULL,
    ADD FOREIGN KEY (family_member_id) REFERENCES users(id),
    ADD FOREIGN KEY (branch_id) REFERENCES branches(id),
    ADD FOREIGN KEY (booking_type_id) REFERENCES booking_types(id); 

CREATE TABLE receipt_family_members (
    id CHAR(36) PRIMARY KEY,
    receipt_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    name VARCHAR(128),
    star VARCHAR(32),
    dob DATE,
    FOREIGN KEY (receipt_id) REFERENCES receipts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
); 