# Subscriptly — Subscription Management & FinOps Platform

> **Phase 1: Foundation Architecture**  
> Developed for **Brightloop Software**

Subscriptly is a modern, enterprise-grade Subscription Management and Revenue Operations (FinOps) system designed with a clean architecture, scalable code organization, and rigorous security practices.

---

## 1. Technology Stack

### Frontend
- **Framework:** React 18 + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS (configured with the approved *Precision FinOps* design system)
- **Routing:** React Router v6
- **HTTP Client:** Axios (configured with credentials and interceptors)
- **Icons:** Lucide React
- **Forms & Validation:** React Hook Form & Zod
- **Typography:** Geist & Inter

### Backend
- **Runtime:** Node.js (v20+ / v24)
- **Framework:** Express.js (REST API architecture)
- **Language:** TypeScript
- **Security:** Helmet, CORS, Express Rate Limit, Cookie Parser
- **Validation:** Zod request body schemas

### Database & ORM
- **Database:** PostgreSQL (with UUID primary keys & relational integrity constraints)
- **ORM:** Prisma ORM v5
- **Migrations:** SQL migrations via Prisma Migrate & Prisma DB Push

### Authentication & Authorization
- **Token Mechanism:** Stateless JSON Web Tokens (JWT) stored in HTTP-only `SameSite=Lax` cookies with Bearer header fallback
- **Hashing:** bcryptjs with 12 salt rounds
- **Reset Mechanism:** Cryptographically secure 32-byte tokens hashed with SHA-256 in the database, with 1-hour expiration
- **Role-Based Access Control (RBAC):** Backend authorization middleware enforcing `ADMIN`, `STAFF`, and `CUSTOMER` roles across every protected route

---

## 2. Project Architecture & Directory Structure

```
odoo-FLUX/
├── client/                     # Frontend SPA (React 18 + Vite + TypeScript)
│   ├── public/
│   ├── src/
│   │   ├── assets/             # Brand logos, icons, fonts, and screenshots
│   │   │   ├── fonts/
│   │   │   ├── icons/
│   │   │   └── images/         # Reference captures from Stitch exports
│   │   ├── components/         # Reusable design system components
│   │   │   ├── common/         # Logo, ComingSoon, DunningAlertBanner
│   │   │   ├── layout/         # Header, Sidebar, UserMenu navigation components
│   │   │   └── ui/             # Badge, Button, Card, Input, Modal primitives
│   │   ├── context/            # AuthContext (persistent sessions, login, logout)
│   │   ├── features/           # Feature-sliced modules (components & pages)
│   │   │   ├── admin/
│   │   │   │   ├── components/ # MetricsKpiBento, PlanBlueprintCard, filters
│   │   │   │   └── pages/      # AdminDashboard, CustomerManagement, Products, Plans, Staff
│   │   │   ├── auth/
│   │   │   │   ├── components/ # AuthHeader, AuthCard
│   │   │   │   └── pages/      # Login, Register, ForgotPassword, ResetPassword
│   │   │   ├── customer/
│   │   │   │   ├── components/ # SubscriptionStatusCard, BillingSummary
│   │   │   │   └── pages/      # CustomerPortalPage, CustomerProfilePage
│   │   │   └── staff/
│   │   │       ├── components/ # StaffTaskCard, OperationsFilter
│   │   │       └── pages/      # StaffDashboardPage, OperationalQueuePage
│   │   ├── hooks/              # Custom React hooks (useAuth)
│   │   ├── layouts/            # AuthLayout & DashboardLayout (role-aware navigation)
│   │   ├── routes/             # AppRoutes with RBAC route protection
│   │   ├── services/           # Axios API services for auth, staff, customer, admin
│   │   ├── styles/             # Global design tokens and Tailwind stylesheets (globals.css)
│   │   ├── types/              # TypeScript models and payloads
│   │   ├── utils/              # Formatting helpers (INR currency, dates, truncators)
│   │   ├── App.tsx
│   │   ├── index.css           # Tailwind design tokens
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js      # Precision FinOps color tokens
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                     # Backend REST API (Node.js + Express + TypeScript)
│   ├── prisma/
│   │   ├── migrations/         # Baseline PostgreSQL migration (20261031000000_init)
│   │   ├── schema.prisma       # User, Customer, PasswordResetToken, AuditLog models
│   │   └── seed.ts             # Seeding script for Admin, Staff, and Customer demo accounts
│   ├── src/
│   │   ├── config/             # Database (Prisma) and Environment configuration (Zod)
│   │   ├── controllers/        # auth, staff, customer, admin controllers
│   │   ├── middleware/         # auth (JWT), role (RBAC), validate (Zod), error handlers
│   │   ├── routes/             # Express API routes
│   │   ├── services/           # Business logic, audit logging, bcrypt, crypto
│   │   ├── tests/              # Automated unit and integration test suites
│   │   ├── types/              # Express Request augmentation & Auth types
│   │   ├── utils/              # Email transporter, JWT, token hashing, password validation
│   │   ├── validators/         # Zod schemas for auth, staff, customer
│   │   ├── app.ts              # Express application setup
│   │   ├── server.ts           # Server entrypoint
│   │   └── index.ts            # Server bootstrap with graceful shutdown
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                       # Project documentation & Stitch design references
│   └── stitch-designs/         # Preserved original HTML & screen captures from Stitch
│       ├── admin_business_overview_dashboard/
│       ├── customer_management_360_view/
│       ├── precision_billing/
│       ├── product_variant_management/
│       └── subscription_plans_configuration/
│
├── scripts/                    # Monorepo development orchestration & database daemons
│   ├── dev.mjs                 # Single-command launcher for DB, API server, and Vite client
│   └── start-db.mjs            # PostgreSQL cluster daemon manager (pg_ctl)
├── .env.example
├── .gitignore
├── package.json                # Monorepo management scripts
└── README.md
```

---

## 3. Database Models (Phase 1 Baseline)

### `User`
- `id`: UUID (Primary Key)
- `name`: String
- `email`: String (Unique, Indexed)
- `passwordHash`: String (bcrypt hash)
- `role`: Enum (`ADMIN`, `STAFF`, `CUSTOMER`)
- `isActive`: Boolean (Default: `true`)
- `emailVerified`: Boolean (Default: `false`)
- `createdAt`, `updatedAt`: DateTime

### `Customer`
- `id`: UUID (Primary Key)
- `userId`: UUID (Unique Foreign Key -> `User.id` with `ON DELETE CASCADE`)
- `companyName`: String (Nullable)
- `contactNumber`: String (Nullable)
- `billingAddress`: String (Nullable)
- `createdAt`, `updatedAt`: DateTime

### `PasswordResetToken`
- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key -> `User.id` with `ON DELETE CASCADE`)
- `tokenHash`: String (SHA-256 hash, Indexed)
- `expiresAt`: DateTime
- `usedAt`: DateTime (Nullable, set upon successful reset)
- `createdAt`: DateTime

### `AuditLog`
- `id`: UUID (Primary Key)
- `userId`: UUID (Nullable Foreign Key -> `User.id` with `ON DELETE SET NULL`)
- `action`: String (e.g., `USER_LOGIN`, `CUSTOMER_REGISTRATION`, `STAFF_CREATED`)
- `entityType`: String
- `entityId`: String (Nullable)
- `metadata`: JSON (Nullable)
- `createdAt`: DateTime

---

## 4. Getting Started Locally

### Prerequisites
- **Node.js:** v20.x or higher
- **PostgreSQL:** v14+ running locally or in Docker

### Step 1: Install Dependencies
```bash
# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install
```

### Step 2: Environment Configuration
In the `server` directory, create a `.env` file based on `.env.example`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# PostgreSQL connection string
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/subscriptly_dev"

# Authentication
JWT_SECRET="subscriptly_jwt_super_secret_phase1_key_development_only_change_in_prod"
JWT_EXPIRES_IN="7d"

# Optional SMTP configuration (defaults to safe console preview in development)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM="Subscriptly <no-reply@subscriptly.io>"
```

### Step 3: Database Migration & Seeding
```bash
cd server

# Generate Prisma Client & push schema to database
npm run prisma:generate
npm run prisma:push

# Seed default test accounts (Admin, Staff, Customer)
npm run prisma:seed
```

### Step 4: Run Development Servers
Open two terminal windows:

**Terminal 1 (Backend API):**
```bash
cd server
npm run dev
# Server listens on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Vite runs on http://localhost:5173
```

---

## 5. Pre-Seeded Demo Credentials

You can use the quick-demo role selector tabs on the login page (`/login`) to instantly test each role:

| Role | Email | Password | Permissions & Dashboard |
|---|---|---|---|
| **ADMIN** | `admin@brightloop.io` | `Admin@Brightloop123!` | Full FinOps dashboard, live DB telemetry, Staff provisioning & status toggle |
| **STAFF** | `staff@brightloop.io` | `Staff@Brightloop123!` | Operational dashboard, customer queue, ticket triage |
| **CUSTOMER** | `customer@brightloop.io` | `Customer@Brightloop123!` | Customer portal, profile editing (name, phone, company, billing address) |

---

## 6. Available REST API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Public customer registration (automatically assigned `CUSTOMER` role)
- `POST /api/auth/login` — Sign in with email & password (sets HTTP-only cookie)
- `POST /api/auth/logout` — Invalidate session and clear auth cookie
- `POST /api/auth/forgot-password` — Issue cryptographically secure reset token (generic response prevents user enumeration)
- `POST /api/auth/reset-password` — Verify SHA-256 token hash and update password
- `GET /api/auth/me` — Fetch currently authenticated user session

### Staff Management (`/api/staff`) — *ADMIN ONLY*
- `GET /api/staff` — List all staff members
- `POST /api/staff` — Provision new staff member (generates secure temporary password)
- `GET /api/staff/:id` — Retrieve specific staff details
- `PATCH /api/staff/:id` — Update permitted staff fields (name, email)
- `PATCH /api/staff/:id/status` — Toggle active / deactivated account status

### Customer Profile (`/api/customers`)
- `GET /api/customers/me` — Retrieve logged-in customer's profile & company billing details
- `PATCH /api/customers/me` — Update name, company name, phone, and billing address

### Admin Control Center (`/api/admin`)
- `GET /api/admin/dashboard` — Fetch MRR metrics, revenue collected, active subscriptions, and real DB telemetry
- `GET /api/admin/users` — List registered users with optional role filtering

### System
- `GET /api/health` — Service health check and timestamp

---

## 7. Running Automated Tests

Run the backend test suite:
```bash
cd server
npm test
```
The test suite verifies:
- Customer registration & strong password enforcement
- Duplicate email prevention
- Password hashing & bcrypt verification
- Non-existent and wrong password rejections
- Cryptographic password reset token creation & expiration
- Deactivated account prevention
- RBAC authorization checks (Admin, Staff, Customer barriers)
- Staff provisioning and status toggling
- Customer profile updates with role immutability
- Admin dashboard metrics formatting

---

## 8. Transition to Phase 2 (Upcoming)

Phase 1 provides the complete foundation for Subscriptly. Future modules (Products, Plans, Quotations, Subscriptions, Invoices, Payments) are mapped in navigation with non-intrusive `ComingSoon` placeholders.
