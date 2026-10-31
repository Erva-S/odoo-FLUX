# Brightloop Billing — Complete Technical & Functional Audit Report

**Date of Audit:** October 31, 2026  
**Project Path:** `C:\Users\Admin\Documents\odoo-FLUX`  
**Audit Purpose:** Comprehensive, evidence-based architectural, functional, security, and database audit following Supabase project creation.  
**Auditor Roles:** Senior Full-Stack Engineer, Software Architect, QA Lead, Database Engineer, Security Auditor.  

---

## 1. OVERALL PROJECT OVERVIEW

### 1.1 What Brightloop Billing Is & The Problem It Solves
**Brightloop Billing** is an enterprise subscription management and FinOps revenue operations system designed for Brightloop Software, a fictional SaaS company. 
Prior to Brightloop Billing, operations ran on spreadsheets, resulting in:
* Missed recurring renewal deadlines.
* Hand-typed invoice errors.
* Tedious, manual bank statement matching for wire and card payments.
* Lack of visibility into real-time recurring revenue, outstanding receivables, and aging overdue invoices.

Brightloop Billing unifies the full subscription lifecycle: product catalog with attribute-based variant pricing (e.g. Brand = Odoo adds +$560), recurring plans with lifecycle rules, quotation templates, subscription progression rails, automated idempotent invoicing, payment reconciliation with partial settlement, and a customer self-service portal.

### 1.2 Main Modules
1. **Catalog & Pricing Engine:** Products, attribute variants (Base + Variant Extra), multi-frequency recurring plans (daily, weekly, monthly, yearly), tax rules, and promotional discounts.
2. **Subscription & Quotation Management:** Quotation templates, unique `SUB-XXXX` contract generation, dynamic line calculations, and an interactive 5-stage lifecycle stepper (`Draft` → `Quotation` → `Confirmed` → `Active` → `Closed`).
3. **Automated Invoicing & Idempotent Billing:** Automated batch invoice generation enforcing a unique constraint on `(subscription_id, billing_period_start)` to guarantee zero duplicate billings, print-friendly invoice layouts, and status tracking (`Draft`, `Confirmed`, `Paid`, `Cancelled`).
4. **Payments & Reconciliation:** Recording payment methods (ACH, Credit Card, Wire, SWIFT), partial installments, balance updates, and automated aging badges (`Paid`, `Outstanding`, `Overdue`).
5. **Finance Dashboard & Reports:** Executive cashflow overview answering *"How much is owed, and by whom?"*, visual balance comparison panel, active subscriptions trend chart, persistent filter bar, and an overdue invoice working queue with 1-click payment entry.
6. **Customer Self-Service Portal:** Clean self-service portal without sidebar displaying 3 large status cards (*What I pay*, *When it renews*, *What I owe*), downloadable invoices, and instant payment settlement.

### 1.3 Current Development Stage
* **Phase 2 Complete: High-Fidelity Interactive Prototype with Verified Database Foundation.**
* The frontend, user journeys, calculations, and Neo-Brutalist design system are 100% built and interactive.
* The Supabase PostgreSQL database is connected, verified, and contains all 14 required tables and constraints.
* **Current Boundary:** The user-facing application pages currently read/write from an in-memory singleton (`src/lib/data/store.ts`). Migration of the application queries to the live database has not yet been started.

### 1.4 What Users Can Actually Do Right Now
* Launch and browse the public landing page ([http://localhost:3000](http://localhost:3000)) and test design tokens at `/styleguide`.
* Test live password validation during signup (reactively checks length, uppercase, lowercase, special character).
* Switch between 1-click demo roles (`Admin`, `Staff`, `Customer`).
* Create a subscription using quotation templates or custom products, selecting the Odoo variant (adding +$560 to base price).
* Advance subscriptions through all 5 stages on the lifecycle rail, automatically generating confirmed invoices.
* Run the automated billing simulator on `/invoices/generate` and view non-blocking progress and summary alerts.
* Record partial and full payments against overdue invoices on `/dashboard` and `/invoices/[id]`.
* Access `/portal` as a customer and simulate paying invoices or downloading receipts.
* Test live PostgreSQL database health via `/api/test-db` or `node scripts/test-connection.mjs`.

---

## 2. TECHNOLOGY STACK

| Category | Technology | Actual Version in Codebase | Status / Type |
|---|---|---|---|
| **Framework** | Next.js (App Router) | `14.2.35` | Installed & Production Built |
| **Language** | TypeScript | `5.6.3` | Configured with strict typing (`tsc` passing) |
| **Runtime** | Node.js | `v24.22.0` | Active runtime |
| **Frontend Library** | React / React-DOM | `18.3.1` | Installed |
| **Styling** | Tailwind CSS | `3.4.15` | Fully custom Neo-Brutalist theme |
| **Typography** | Fontshare Fonts | Cabinet Grotesk (800) & Satoshi (500) | Self-hosted woff2 files in `/public/fonts` |
| **Icons** | Lucide React | `0.469.0` | Installed |
| **Database** | PostgreSQL | `17.11.0.011` | Managed on Supabase (`eu-west-2`) |
| **Supabase Client (SSR)** | `@supabase/ssr` | `0.5.2` | Installed & Configured |
| **Supabase Client (JS)** | `@supabase/supabase-js` | `2.49.1` | Installed & Configured |
| **Schema Definition** | SQL DDL & Migrations | PostgreSQL DDL | Located in `supabase/migrations/` |
| **Environment Configuration** | `.env.local` | Git-ignored | Configured with live project URL and keys |
| **Validation** | Zod | `3.23.8` | Installed |
| **Testing** | Automated Test Runner | *None* | `npm test` has no script; `scripts/test-connection.mjs` exists |
| **Linting** | ESLint | *Unconfigured* | Missing `.eslintrc.json` |

---

## 3. FRONTEND STATUS

### 3.1 Route-by-Route Audit

| Route | Page File | Completeness | Interactive Features | Status |
|---|---|---|---|---|
| `/` | `src/app/page.tsx` | **100% Complete** | 7 Neo-Brutalist sections, pricing cards, mockup window preview, CTAs | **FULLY WORKING** |
| `/styleguide` | `src/app/styleguide/page.tsx` | **100% Complete** | Push buttons, input focus rings, badges, toasts, mockup windows, rail | **FULLY WORKING** |
| `/login` | `src/app/login/page.tsx` | **100% Complete** | 1-click role switcher (Admin, Staff, Customer), login form | **FULLY WORKING** |
| `/signup` | `src/app/signup/page.tsx` | **100% Complete** | 4-point live reactive password rule checklist, registration form | **FULLY WORKING** |
| `/forgot-password` | `src/app/forgot-password/page.tsx` | **Partial** | Form inputs and confirmation alert work; no real email is sent | **UI ONLY** |
| `/dashboard` | `src/app/dashboard/page.tsx` | **100% Complete** | Cashflow panel, trend bar chart, persistent filter, payment modal | **FULLY WORKING** |
| `/subscriptions` | `src/app/subscriptions/page.tsx` | **100% Complete** | Search, status filter pills, pagination, row navigation | **FULLY WORKING** |
| `/subscriptions/new` | `src/app/subscriptions/new/page.tsx` | **100% Complete** | Template selector, dynamic line items, Odoo variant addon, tax calc | **FULLY WORKING** |
| `/subscriptions/[id]` | `src/app/subscriptions/[id]/page.tsx` | **100% Complete** | 5-stage lifecycle rail, live printable invoice mockup, print view | **FULLY WORKING** |
| `/invoices` | `src/app/invoices/page.tsx` | **100% Complete** | Search, status filters, overdue highlighting, pagination | **FULLY WORKING** |
| `/invoices/generate` | `src/app/invoices/generate/page.tsx` | **100% Complete** | Non-blocking execution progress bar, idempotency summary report | **FULLY WORKING** |
| `/invoices/[id]` | `src/app/invoices/[id]/page.tsx` | **100% Complete** | Confirm, cancel, send, print view, partial payment modal | **FULLY WORKING** |
| `/payments` | `src/app/payments/page.tsx` | **100% Complete** | Payment transactions ledger, search, method badges, pagination | **FULLY WORKING** |
| `/customers` | `src/app/customers/page.tsx` | **100% Complete** | Customer directory, subscription counter, search | **FULLY WORKING** |
| `/catalog` | `src/app/catalog/page.tsx` | **Partial** | Displays products, variants, and plans; creation link works; edit/delete missing | **PARTIALLY WORKING** |
| `/catalog/new` | `src/app/catalog/new/page.tsx` | **100% Complete** | Product creation form with multi-variant configuration | **FULLY WORKING** |
| `/discounts` | `src/app/discounts/page.tsx` | **100% Complete** | Active promotions cards, rate display, usage caps | **FULLY WORKING** |
| `/discounts/new` | `src/app/discounts/new/page.tsx` | **100% Complete** | Promo code builder (% or fixed, limits, minimums) | **FULLY WORKING** |
| `/settings` | `src/app/settings/page.tsx` | **100% Complete** | Admin staff provisioning form, tax rule registration | **FULLY WORKING** |
| `/portal` | `src/app/portal/page.tsx` | **100% Complete** | 3 status cards (*What I pay*, *When it renews*, *What I owe*), pay modal | **FULLY WORKING** |
| `/api/cron/billing` | `src/app/api/cron/billing/route.ts` | **100% Complete** | Automated billing runner endpoint (GET/POST) | **FULLY WORKING** |
| `/api/test-db` | `src/app/api/test-db/route.ts` | **100% Complete** | Live PostgreSQL health check endpoint via Supabase client | **FULLY WORKING** |

### 3.2 UI/UX Quality & Design Token Adherence
* **Border Compliance:** Every card, button, input, badge, table, and panel strictly enforces `2px solid #000000`.
* **Shadow Compliance:** Zero soft shadows or gradients. Strict hard offsets: `4px 4px 0 #000` (standard), `8px 8px 0 #000` (large panels), `12px 12px 0 #000` (mockup windows).
* **Button Physics:** Tactile hover/active state translates `(4px, 4px)` and removes shadow with `cubic-bezier(0.175, 0.885, 0.32, 1.275)` spring curves.
* **Badge Compliance:** Strict pill format with approved status colors (Green `#28c840`, Amber `#febc2e`, Red `#ff5f57`, Sage `#b7c6c2`, Dark `#272727`, Dashed Canvas `#f4f4f5`).
* **Broken Links:** **0**. All navigation items, breadcrumbs, and detail routes resolve cleanly without 404s.

---

## 4. BACKEND STATUS

### 4.1 Server APIs & Route Handlers
* `/api/test-db`: Fully implemented. Uses `createAdminClient()` from `src/lib/supabase/admin.ts`, performs count queries on database tables, calculates round-trip latency, and returns structured JSON health checks.
* `/api/cron/billing`: Implemented. Runs idempotent batch billing against the in-memory data store.

### 4.2 Query Layer Reality (Crucial Finding)
* **Live PostgreSQL Queries:** Only executed inside `/api/test-db` and `scripts/test-connection.mjs`.
* **Application Module Queries:** All 19 application routes currently query `src/lib/data/store.ts` directly.
* **Mutation Persistence:** Mutations (creating subscriptions, advancing stages, adding products, recording payments) modify the JavaScript in-memory store for the active browser session. They do not persist across server restarts or database reloads.

### 4.3 Validation & Error Handling
* Form inputs validate types, required fields, and numerical constraints before calling store methods.
* Error toasts display actionable error messages without raw stack traces.
* Server route handlers wrap logic in `try/catch` and return appropriate HTTP status codes (200, 201, 500).

---

## 5. POSTGRESQL AND SUPABASE AUDIT

### 5.1 Connection & Environment Status
* **Supabase Project Name:** `brightloop-billing`
* **Project Reference:** `wjbmmmejfunghtpmtgrq`
* **Region:** `eu-west-2` (AWS London)
* **Status:** `ACTIVE_HEALTHY`
* **Database Host:** `db.wjbmmmejfunghtpmtgrq.supabase.co`
* **Environment Variables:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are configured in `.env.local`. None are hardcoded.

### 5.2 Database Tables Audit
Querying `information_schema.tables` confirmed that all **14 required tables** exist in the `public` schema:
1. `profiles`
2. `taxes`
3. `products`
4. `product_variants`
5. `plans`
6. `discounts`
7. `quotation_templates`
8. `quotation_template_lines`
9. `subscriptions`
10. `subscription_lines`
11. `invoices`
12. `invoice_lines`
13. `payments`
14. `discount_usages`

### 5.3 Constraints & Indexes Audit
* **Unique Constraints:**
  * `uq_subscription_period` on `invoices (subscription_id, billing_period_start)` is **ACTIVE** (Type: `u`).
  * `invoices_invoice_number_key` on `invoices (invoice_number)` is **ACTIVE**.
  * `subscriptions_subscription_number_key` on `subscriptions (subscription_number)` is **ACTIVE**.
  * `discounts_code_key` on `discounts (code)` is **ACTIVE**.
  * `profiles_email_key` on `profiles (email)` is **ACTIVE**.
* **Foreign Keys:**
  * `subscriptions.customer_id` → `profiles.id` (RESTRICT)
  * `subscriptions.plan_id` → `plans.id` (RESTRICT)
  * `subscription_lines.subscription_id` → `subscriptions.id` (CASCADE)
  * `invoices.subscription_id` → `subscriptions.id` (RESTRICT)
  * `invoices.customer_id` → `profiles.id` (RESTRICT)
  * `invoice_lines.invoice_id` → `invoices.id` (CASCADE)
  * `payments.invoice_id` → `invoices.id` (CASCADE)
* **Indexes:** 11 custom indexes active (`idx_subscriptions_status`, `idx_subscriptions_customer`, `idx_subscriptions_plan`, `idx_invoices_status`, `idx_invoices_customer`, `idx_invoices_due_date`, `idx_invoices_period_start`, `idx_invoices_sub_id`, `idx_payments_invoice`, `idx_payments_customer`, `idx_payments_date`).

### 5.4 Row Level Security (RLS) Status
* **RLS Enabled:** Active on all 14 tables in the `public` schema.
* **Policies Active:** 24 distinct policies enforcing role permissions (`admin`, `staff`, `customer`).
* **Stored Functions:** `get_user_role()` and `generate_recurring_invoices()` exist in the database.

### 5.5 Supabase Integration Mapping Table

| Application Module | Current Data Source | PostgreSQL Status | Action Needed to Migrate |
|---|---|---|---|
| `/catalog` & `/catalog/new` | `src/lib/data/store.ts` (Memory) | Tables `products`, `product_variants`, `plans` exist (0 rows) | Seed initial products/plans, replace store calls with Supabase client |
| `/subscriptions` & `/subscriptions/new` | `src/lib/data/store.ts` (Memory) | Tables `subscriptions`, `subscription_lines`, `quotation_templates` exist (0 rows) | Replace store creation with Supabase insert |
| `/subscriptions/[id]` (Lifecycle Rail) | `src/lib/data/store.ts` (Memory) | Table `subscriptions` exists | Replace stage advance with Supabase update |
| `/invoices` & `/invoices/[id]` | `src/lib/data/store.ts` (Memory) | Tables `invoices`, `invoice_lines` exist | Query Supabase invoices table |
| `/invoices/generate` | `src/lib/data/store.ts` (Memory) | Function `generate_recurring_invoices()` exists | Call database RPC function |
| `/payments` | `src/lib/data/store.ts` (Memory) | Table `payments` exists | Insert into Supabase payments table |
| `/dashboard` | `src/lib/data/store.ts` (Memory) | Aggregate metrics calculated in-memory | Query PostgreSQL aggregate view / RPC |
| `/portal` | `src/lib/data/store.ts` (Memory) | Table `subscriptions` exists with RLS | Query Supabase with authenticated customer session |

---

## 6. AUTHENTICATION AND SECURITY AUDIT

### 6.1 Authentication Mechanism
* Current authentication is managed by `src/lib/auth/AuthContext.tsx` and stores session state in the browser's `localStorage` (`brightloop_active_user`).
* Preloaded demo profiles:
  * Admin: `admin@brightloop.io`
  * Staff: `staff@brightloop.io`
  * Customer: `customer@acme.corp`
* **Vulnerability:** Unauthenticated users can bypass the login form by setting `localStorage.setItem("brightloop_active_user", ...)` in browser DevTools.

### 6.2 Route Guards & Server Middleware
* Next.js server-side `middleware.ts` is **NOT YET CONFIGURED**.
* Navigation to `/dashboard`, `/subscriptions`, or `/settings` is protected only by client-side React rendering logic. An unauthenticated direct HTTP request returns the page markup.

### 6.3 Password Validation & Reset
* **Live Password Validation:** **FULLY WORKING**. Evaluates `length > 8`, `/[A-Z]/`, `/[a-z]/`, and `/[!@#$%^&*(),.?":{}|<>]`.
* **Password Reset:** **UI ONLY**. Submitting `/forgot-password` displays a success alert, but no email or recovery token is generated.

### 6.4 Customer Data Isolation
* Current portal isolation is performed in client JavaScript:
  ```typescript
  const customerSubs = useMemo(() => {
    return dataStore.subscriptions.filter(
      (s) => s.customerId === customerId || s.customerEmail === currentUser?.email
    );
  }, [customerId, currentUser]);
  ```
* **Security Risk:** Because data filtering is not yet enforced by database RLS, client-side isolation is insufficient for production.

---

## 7. BUSINESS FEATURES AUDIT TABLE

| Feature | Required Behavior | Implemented State | Classification | Evidence |
|---|---|---|---|---|
| **Products & Variants** | Base price + variant price extra (e.g. Odoo adds +560) | Modeled in store and UI; Odoo variant adds $560 to $1,200 base = $1,760 | **PARTIALLY WORKING** | Store works; DB table exists; full edit/delete UI missing |
| **Recurring Plans** | Daily/weekly/monthly/yearly frequencies; lifecycle flags | 4 plans seeded with `autoClose`, `allowPause`, `allowRenew`, `allowEarlyClose` | **PARTIALLY WORKING** | Store works; DB table exists; plan creator UI missing |
| **Customers** | Customer directory with company names, phone, address | 40 customer accounts modeled and searchable | **PARTIALLY WORKING** | Store works; DB table exists; reads from memory |
| **Quotation Templates** | Presets with lines and validity days to avoid blank starts | 2 templates seeded; applied with 1 click in quote builder | **FULLY WORKING** | Applied on `/subscriptions/new` |
| **Subscription Lifecycle** | 5 stages (`Draft` → `Quotation` → `Confirmed` → `Active` → `Closed`) | Interactive lifecycle rail on charcoal panel; next action button | **FULLY WORKING** | Tested on `/subscriptions/[id]` |
| **Invoicing & Taxes** | Auto-generate invoices from subscriptions with 10% VAT | Computed automatically on confirmation; print view provided | **FULLY WORKING** | Tested on `/invoices/[id]` |
| **Idempotent Billing** | Unique constraint prevents double-billing for same period | `uq_subscription_period` constraint in DB; JS generator skips existing | **FULLY WORKING** | Tested via `/api/cron/billing` |
| **Discounts Engine** | % or fixed credits with usage limits; deducted before tax | `WELCOME10` (10%) and `BRIGHT50` ($50) deduct before VAT | **FULLY WORKING** | Tested on `/discounts` and line calculations |
| **Payments Ledger** | Partial and full payments; updates status to Paid/Overdue | Partial payment updates balance; overdue queue on dashboard | **FULLY WORKING** | Tested on `/dashboard` and `/payments` |
| **Tax Rules** | Dynamic tax percentage applied to invoice line totals | 10% VAT applied across all invoice generators | **FULLY WORKING** | Formatted and totaled on invoice preview |
| **Finance Dashboard** | Revenue collected vs owed; trend chart; overdue queue | 8px-shadow panel, bar chart, and working area payment entry | **FULLY WORKING** | Tested on `/dashboard` |
| **Email Notifications** | Password reset & invoice dispatch via email | UI toasts and alerts only; no SMTP / Resend integration | **NOT IMPLEMENTED** | No mail transport configured |

---

## 8. TESTING AND BUILD VERIFICATION

### 8.1 TypeScript Typecheck (`npx tsc --noEmit`)
* **Result:** **PASSED with 0 errors**.
* All pages, UI components, Supabase clients, and database interfaces adhere to strict typing.

### 8.2 Production Build (`npm run build`)
* **Result:** **PASSED**.
* Compiled 22 routes statically and dynamically without errors:
  * 19 Static/SSG routes (`○`)
  * 3 Dynamic/SSR routes (`ƒ`): `/api/cron/billing`, `/api/test-db`, `/subscriptions/[id]`, `/invoices/[id]`.

### 8.3 Linting (`npm run lint`)
* **Result:** **UNCONFIGURED**.
* Prompted for interactive setup because `.eslintrc.json` is not committed. Needs an ESLint configuration file.

### 8.4 Automated Tests (`npm test`)
* **Result:** **MISSING SCRIPT**.
* No unit or end-to-end test framework (Jest / Vitest / Playwright) is currently configured in `package.json`.

### 8.5 Database Connection Test (`node scripts/test-connection.mjs`)
* **Result:** **PASSED (14/14 tables verified)**.
* Output: `Verified 14/14 tables in PostgreSQL database. Connection Latency: 285ms. SUCCESS!`

---

## 9. PROJECT COMPLETION ANALYSIS

```text
+-----------------------------------------------------------------------+
| BRIGHTLOOP BILLING — REALISTIC COMPLETION BREAKDOWN                   |
+-----------------------------------------------------------------------+
| Frontend UI/UX & Design Tokens : [====================] 95%           |
| Business Logic & Workflows    : [=================---] 85%           |
| PostgreSQL & Database Setup   : [====================] 100% (Found.)  |
| Database Integration (Modules): [--------------------]  0% (Pending) |
| Authentication & Route Guards : [======--------------] 30%           |
| Testing, Linting & CI         : [=====---------------] 25%           |
+-----------------------------------------------------------------------+
| OVERALL REAL IMPLEMENTATION   : [=============-------] 65%           |
+-----------------------------------------------------------------------+
```

### Evidence-Based Justification:
* **Frontend (95%):** All 20+ screens, modals, tables, and design tokens are implemented, responsive, and functional.
* **Business Logic (85%):** Lifecycle rail, variant pricing (+560), idempotent billing runs, partial payments, and overdue aging all work reliably.
* **Database Foundation (100%):** Supabase project is active, tables are created, RLS policies exist, and client libraries are configured.
* **Database Integration (0%):** The user-facing application modules still read and write from `store.ts` in browser memory.
* **Authentication (30%):** Client mock auth works for demo purposes, but Supabase Auth, HTTP cookies, and server middleware are not yet attached.
* **Testing (25%):** Typecheck, production build, and DB connection test pass, but unit/e2e test suites and ESLint configs are missing.

---

## 10. PRIORITIZED REMAINING WORK & ROADMAP

```mermaid
flowchart TD
    A["Phase 2: Database Foundation (DONE)"] --> B["Phase 3: Module Migration (P0)"]
    B --> C["Phase 4: Supabase Auth & Security (P0)"]
    C --> D["Phase 5: Feature Completion (P1)"]
    D --> E["Phase 6: Testing & Production Polish (P2)"]
    
    subgraph "Phase 3: Module Migration (P0)"
        B1["Seed initial catalog, plans & taxes into PostgreSQL"]
        B2["Migrate Catalog & Subscriptions queries to Supabase Client"]
        B3["Migrate Invoicing & Payments queries to Supabase Client"]
    end
    
    subgraph "Phase 4: Auth & Security (P0)"
        C1["Switch AuthContext to Supabase Auth"]
        C2["Implement Next.js middleware.ts for server route protection"]
        C3["Enforce customer portal data isolation via Postgres RLS"]
    end
```

### Priority 0 — Critical (Immediate Database & Auth Integration)
1. **Seed Live Database:** Populate `products`, `product_variants`, `plans`, `taxes`, and `discounts` into PostgreSQL.
2. **Migrate Catalog & Subscriptions:** Update `/catalog` and `/subscriptions` to query Supabase tables instead of `store.ts`.
3. **Migrate Invoices & Payments:** Connect invoice generation and payment recording to PostgreSQL with RLS.
4. **Implement Server Route Guards:** Add Next.js `middleware.ts` to protect `/dashboard`, `/subscriptions`, and `/settings` at the HTTP request level.
5. **Switch Auth to Supabase Auth:** Replace `localStorage` mock authentication with `@supabase/ssr` cookie-based authentication.

### Priority 1 — Important (Functional Completeness)
1. **Password Reset Page:** Build `/reset-password` token redemption view and connect Supabase Auth reset dispatch.
2. **Product & Plan Editing:** Add Edit/Delete modals in the Catalog view.
3. **Table Column Sorting:** Add interactive column header click-to-sort on data tables.
4. **Automated Cron Trigger:** Configure Supabase `pg_cron` to call `generate_recurring_invoices()` on schedule.

### Priority 2 — Polish (Production Readiness)
1. **ESLint Configuration:** Add `.eslintrc.json` to enable automated lint checks during CI.
2. **Automated Test Suite:** Add Playwright end-to-end tests for the subscription lifecycle and payment flow.
3. **CSV Export:** Add export functionality to Invoices and Subscriptions tables.

---

## 11. EXACT NEXT RECOMMENDED TASK

**Recommended Next Task:**  
**Execute Phase 3, Step 1: Database Seeding & Catalog Data Migration.**  
Seed the 3 core products (including the Odoo variant), 4 plans, 2 taxes, and 2 discounts into the live PostgreSQL database on Supabase, and switch `/catalog` to read from the live database.

---
*End of Audit Report.*

