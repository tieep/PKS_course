# PKS Course & Enrollment Portal

## Overview

**PKS Course & Enrollment Portal** is a mini web application for browsing, managing, and enrolling in technology courses. Built with a decoupled Client-Server architecture supporting **Student** and **Admin** roles.

### Key Highlights
- **Tech Stack:** React 19 (Vite, Tailwind CSS, React Router v7) & Node.js (Express 5, MySQL).
- **Concurrency & Race Condition Handling:** Uses **MySQL Transactions & Row Locking (`SELECT ... FOR UPDATE`)** to prevent over-enrollment on final course seats.
- **Security:** Passwords encrypted using `bcrypt` (salt rounds: 10), stateless JWT auth with HTTP cookies/bearer token, and strict RBAC middleware.
- **UX Feedback:** Toast notifications (`react-hot-toast`), empty states, and disabled submit buttons.

---

##  Demo & Test Accounts

Use the following pre-configured credentials to test both roles:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `tiepte@gmail.com` | `123456` | Course CRUD, toggle visibility, view enrolled students |
| **Student** | `duy11@example.com` | `123456` | Browse courses, enroll, view enrolled courses ("My Courses") |

*(You can also use the **Register** form to create a new Student account).* and change the role in DB to change role from Student to Admin (just in case password is wrong).

---

## Quick Start Guide

### 1. Database Setup (MySQL)
Create database `pks_course` and import data:

1. **Recommended (Primary):** Import the complete database dump:
   ```text
   PKS_Course_Be/database/pks_course.sql
   ```
2. **Fallback:** If you encounter any compatibility issues with the dump above, import the clean schema & seed script:
   ```text
   PKS_Course_Be/database/02-schema-and-seed.sql
   ```
NOTE: you have to create 2 new acc with this schema, one with Student role, one with Admin role(change the role from Student to Admin in DB)
---

### 2. Backend Setup (`PKS_Course_Be`)

```bash
cd PKS_Course_Be
npm i
```

Create `.env` file (copy from `.env.example`):
```env
PORT=xxxx
DB_HOST=localhost
DB_PORT=
DB_USER=root
DB_PASSWORD=your_mysql_password (if empty DB_PASSWORD = "")
DB_NAME=pks_course
FRONTEND_URL=http://localhost:5173
JWT_SECRET=super_secret_jwt_key_2026
JWT_EXPIRES_IN=1h (or 10m, 1d)
```

Start backend:
```bash
npm run dev

```

---

### 3. Frontend Setup (`PKS_Course_FE`)

```bash
cd PKS_Course_FE
npm i
```

Create `.env` file (copy from `.env.example`):
```env
VITE_API_URL=http://localhost:xxxx/api (replace xxx with your port)
```

Start frontend:
```bash
npm run dev
# App running at http://localhost:5173
```

---

## 📁 Project Structure

```text
├── docs/                                    # Sơ đồ ERD, Postman collection & Test report
│   ├── ERD.png
│   ├── PKS_course.postman_collection.json
│   └── PKS_Course_Postman_Test_Report.pdf
├── PKS_Course_Be/                           # Node.js Express Backend
│   ├── database/
│   │   ├── pks_course.sql                   # Primary MySQL dump
│   │   └── 02-schema-and-seed.sql           # Fallback schema & seed
│   ├── src/                                 # Controllers, Services, Repositories, Middlewares
│   └── .env.example
├── PKS_Course_FE/                           # React Vite Frontend
│   ├── src/                                 # Features (Auth, Courses, Admin), Components
│   └── .env.example
└── README.md
```

---

##  Testing & Documentation

All API documentation and test assets are provided under [`/docs`](file:///d:/interview_test/docs):
- **ERD Diagram:** [`docs/ERD.png`](file:///d:/interview_test/docs/ERD.png)
- **Postman Collection:** [`docs/PKS_course.postman_collection.json`](file:///d:/interview_test/docs/PKS_course.postman_collection.json)
- **Postman Test Report:** [`docs/PKS_Course_Postman_Test_Report.pdf`](file:///d:/interview_test/docs/PKS_Course_Postman_Test_Report.pdf) (Includes screenshots of successful requests and error handling: 400, 401, 403, 404, 409).
- **VS Code REST Client:** [`PKS_Course_Be/api.http`](file:///d:/interview_test/PKS_Course_Be/api.http)
