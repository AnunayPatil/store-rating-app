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


Fast Reproduction & Setup Guide
1. Prerequisites
Node.js: v18.x or v20+

Package Manager: npm

2. Backend Initialization
# 1. Navigate to the backend directory
cd server

# 2. Install dependencies
npm install

# 3. Synchronize database and generate Prisma Client
npx prisma generate
npx prisma db push

# 4. Seed test accounts & initial entities
node seed.js

# 5. Start the backend REST service
node server.js

3. Frontend Initialization

# 1. Navigate to the client directory
cd client

# 2. Install dependencies
npm install

# 3. Start the Vite React development server
npm run dev



Complete REST API Specification
🔐 Authentication Service
POST /api/auth/register — Public registration for standard users[cite: 1].

POST /api/auth/login — Single login endpoint returning signed JWT and role descriptor[cite: 1].

PUT /api/auth/change-password — Protected password renewal for authenticated accounts[cite: 1].

🛡️ Administrator Service (Bearer <ADMIN_JWT>)
GET /api/admin/dashboard — Returns system metrics (totalUsers, totalStores, totalRatings)[cite: 1].

GET /api/admin/users?search=&role=&sortBy=&sortOrder= — Filtered, searchable, and sorted user list[cite: 1].

POST /api/admin/users — Admin creation of ADMIN or NORMAL_USER profiles[cite: 1].

GET /api/admin/stores?search=&sortBy=&sortOrder= — Store listings with computed average star score[cite: 1].

POST /api/admin/stores — Registers a new store and assigns ownership[cite: 1].

👤 Normal User Service (Bearer <USER_JWT>)
GET /api/stores?search=&sortBy=&sortOrder= — Store listings with computed overall score and current user's rating[cite: 1].

POST /api/ratings — Atomic upsert (submission/modification) of a 1–5 store rating[cite: 1].

🏪 Store Owner Service (Bearer <OWNER_JWT>)
GET /api/owner/dashboard — Aggregates store average rating and lists all review submissions[cite: 1].

🧪 Step-by-Step Evaluator Test Script
Verify Role Redirection:

Log in with admin@storerating.com → Redirects to /admin[cite: 1].

Log out, log in with user@storerating.com → Redirects to /stores[cite: 1].

Log out, log in with owner@storerating.com → Redirects to /owner[cite: 1].

Verify Rating & Modification:

As user@storerating.com, select store Downtown Supermarket Express and submit a 5-star rating[cite: 1].

Notice the "Overall Rating" and "My Rating" instantly update to 5[cite: 1].

Change your rating to 3 stars → Confirm the rating successfully updates without creating duplicate entries[cite: 1].

Verify Store Owner Real-Time View:

Switch back to owner@storerating.com[cite: 1].

Verify that the customer table now reflects Regular Platform Customer with a rating of 3[cite: 1].

Verify Admin Dashboard Aggregates:

Log in as admin@storerating.com[cite: 1].

Confirm Total Ratings incremented to 1[cite: 1].

Locate Store Owner Representative in the Users table; confirm Store Rating shows ⭐ 3.0 instead of N/A or empty[cite: 1].
