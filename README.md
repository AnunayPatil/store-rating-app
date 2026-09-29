# 🏬 Store Rating Web Application (Full-Stack Assessment)

> A full-stack role-based store directory and user rating platform built for the **FullStack Intern Coding Challenge**.

---

## 📌 Executive Summary

This platform allows registered users to browse stores and submit or modify ratings on a 1-to-5 scale. It features a unified single-login system that dynamically delivers role-tailored dashboards and authorization guards across three distinct user roles: **System Administrator**, **Normal User**, and **Store Owner**.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technologies Used | Justification |
| :--- | :--- | :--- |
| **Frontend** | React 18, React Router v6, Axios | Single-page application architecture with client-side route guards and responsive state handling. |
| **Backend** | Node.js, Express.js | Lightweight RESTful microservice with custom role-based access control (RBAC) middleware. |
| **Security & Auth** | JSON Web Tokens (JWT), Bcrypt.js | Stateless authentication with 1-day token lifecycle and salted password hashing (cost factor 10). |
| **Database & ORM** | SQLite, Prisma ORM | Relational schema integrity enforced via foreign keys and compound unique constraints. |
| **Data Validation** | Zod (Backend), Custom Regex (Frontend) | Dual-tier defensive validation matching all strict business requirements. |

---

## 👥 Role Matrix & Key Functionalities

### 1. 🛡️ System Administrator
- **Analytical Dashboard:** Live aggregated metric counters for **Total Users**, **Total Stores**, and **Total Ratings Submitted**.
- **User Management Table:**
  - Lists all users displaying: `Name`, `Email`, `Address`, and `Role`.
  - **Dynamic Evaluation:** Automatically calculates and displays the average store rating for users with the `STORE_OWNER` role (`N/A` for others).
  - **Live Multi-Field Search:** Instant filtering across `Name`, `Email`, and `Address`.
  - **Role Filter Dropdown:** Filter by `ADMIN`, `NORMAL_USER`, or `STORE_OWNER`.
  - **Column Sorting:** Bidirectional (Ascending/Descending) sorting on key columns.
- **Store Management:**
  - View all registered stores with `Name`, `Email`, `Address`, and calculated `Overall Rating`.
  - Add new stores directly to the system.
- **Administrative Account Provisioning:** Ability to create both new Normal Users and Administrators.
- **Session Control:** Secure logout.

### 2. 👤 Normal User
- **Self-Service Registration:** Public sign-up interface adhering strictly to validation boundaries.
- **Stores Directory:**
  - Search stores by `Name` and `Address`.
  - Bidirectional column sorting on store listings.
  - View overall store rating alongside the current user's submitted score.
- **Interactive Rating System:**
  - Submit ratings from **1 to 5 stars**.
  - Modify a previously submitted rating seamlessly with zero duplicates.
- **Profile Security:** Authenticated password updates.
- **Session Control:** Secure logout.

### 3. 🏪 Store Owner
- **Store Analytics Dashboard:**
  - Displays assigned store name and calculated average rating.
  - **Rater Audit Log:** Detailed breakdown table of all customers who submitted reviews (Customer Name, Email, and Star Rating).
- **Profile Security:** Authenticated password updates.
- **Session Control:** Secure logout.

---

## 📐 Data Validation Specifications

Both frontend forms and backend endpoints validate against these rules[cite: 1]:

| Field | Constraints | Implemented Rule |
| :--- | :--- | :--- |
| **Name** | Min 20, Max 60 chars[cite: 1] | `z.string().min(20).max(60)` |
| **Address** | Max 400 chars[cite: 1] | `z.string().max(400)` |
| **Email** | RFC-compliant email standard[cite: 1] | `z.string().email()` / RFC regex pattern |
| **Password** | 8–16 chars, ≥ 1 uppercase, ≥ 1 special char[cite: 1] | `/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/` |
| **Rating** | Integer between 1 and 5[cite: 1] | `1 <= rating <= 5` |

---

## 🗄️ Database Schema & Integrity

```text
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│              User               │       │              Store              │
├─────────────────────────────────┤       ├─────────────────────────────────┤
│ id: String (UUID, PK)           │1     *│ id: String (UUID, PK)           │
│ name: String (20-60 chars)      ├───────┤ name: String                    │
│ email: String (Unique)          │       │ email: String (Unique)          │
│ password: String (Bcrypt Hash)  │       │ address: String (max 400)       │
│ address: String (max 400)       │       │ ownerId: String (FK -> User.id) │
│ role: String (ADMIN/USER/OWNER) │       │ createdAt: DateTime             │
│ createdAt: DateTime             │       └───────────────┬─────────────────┘
└───────────────┬─────────────────┘                       │ 1
                │ 1                                       │
                │         ┌───────────────────────┐       │
                │         │        Rating         │       │
                │         ├───────────────────────┤       │
                └────────*│ id: String (UUID, PK) │*──────┘
                          │ rating: Int (1-5)     │
                          │ userId: String (FK)   │
                          │ storeId: String (FK)  │
                          │ updatedAt: DateTime   │
                          ├───────────────────────┤
                          │ UNIQUE(userId,storeId)│
                          └───────────────────────┘
