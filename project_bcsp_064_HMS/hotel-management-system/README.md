# Hotel Management System (HMS)

A production-structured Hotel Management System web application built with **Node.js (Express)**, **MySQL**, and **Redis**.

## ✅ Features
- Session-based authentication with **role-based access (Guest, Receptionist, Manager)**
- CRUD for rooms and room types (Manager)
- Booking engine with **transactional locking** and **overlap prevention**
- Billing calculations (room, services, tax)
- Reports (occupancy rate, revenue, pending bills, popular room types)
- Secure configuration: helmet, rate limiting, SQL injection protection
- Uses provided `hms_schema.sql` schema (must not be modified)

---

## 🧩 Getting Started

### 1) Prerequisites
- Node.js v16+
- MySQL 8.0+
- Redis 6+

### 2) Install dependencies

```bash
npm install
```

### 3) Database setup

1. Create the database and tables by importing the schema:

```bash
mysql -u root -p < hms_schema.sql
```

2. Verify the database `hotel_management_db` exists and has tables.

### 4) Configure environment variables

Copy the example file and update values:

```bash
cp .env.example .env
```

### 5) Run the app

```bash
npm start
```

App will run on `http://localhost:3000` by default.

---

## 🧪 Default Test Credentials

### Manager
- Email: `admin@hotel.com`
- Password: `password123` (hashed in sample data)

### Receptionist
- Email: `reception@hotel.com`
- Password: `password123`

### Sample Guest
- Email: `rahul.sharma@example.com`
- Password: `password123`

> ⚠️ For security, replace these credentials in production.

---

## 📁 Project Structure

See `/hotel-management-system` for the full structure described in the assignment.

---

## 🗂️ Notes
- **Do not edit `hms_schema.sql`**. It contains the authoritative schema and seed data.
- Booking logic relies on SQL `SELECT ... FOR UPDATE` to enforce ACID locking.

