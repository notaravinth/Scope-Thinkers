CREATE DATABASE IF NOT EXISTS society_management;
USE society_management;

CREATE TABLE IF NOT EXISTS society_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firebase_uid VARCHAR(128) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    role ENUM('resident','owner','committee','security','manager')
        NOT NULL DEFAULT 'resident',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS society_properties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    flat_number VARCHAR(20) NOT NULL,
    block VARCHAR(20) NOT NULL,
    owner_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_property (block, flat_number),
    CONSTRAINT fk_property_owner
        FOREIGN KEY (owner_id) REFERENCES society_users(id)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS society_complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('pending','in_progress','resolved','closed')
        NOT NULL DEFAULT 'pending',
    created_by INT NOT NULL,
    assigned_to INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_complaint_creator
        FOREIGN KEY (created_by) REFERENCES society_users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_complaint_assignee
        FOREIGN KEY (assigned_to) REFERENCES society_users(id)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS society_visitors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    visitor_name VARCHAR(100) NOT NULL,
    resident_id INT NOT NULL,
    visit_date DATE NOT NULL,
    status ENUM('expected','entered','exited')
        NOT NULL DEFAULT 'expected',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_visitor_resident
        FOREIGN KEY (resident_id) REFERENCES society_users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS society_announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_announcement_creator
        FOREIGN KEY (created_by) REFERENCES society_users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS society_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    property_id INT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('pending','paid','overdue')
        NOT NULL DEFAULT 'pending',
    paid_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_user
        FOREIGN KEY (user_id) REFERENCES society_users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_payment_property
        FOREIGN KEY (property_id) REFERENCES society_properties(id)
        ON DELETE SET NULL
);

-- The first account created through the app is a resident.
-- Promote a test account to manager after signup:
-- UPDATE society_users SET role = 'manager' WHERE email = 'your-email@example.com';
