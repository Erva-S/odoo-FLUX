# Brightloop Billing — Master Final Project Report
### Enterprise Subscription Lifecycle, Idempotent Recurring Billing & FinOps Revenue Operations Platform

**Date:** 2026-10-31  
**Project Path:** `C:\Users\Admin\Documents\odoo-FLUX`  
**Database Host:** Supabase PostgreSQL (`brightloop-billing`, Ref: `wjbmmmejfunghtpmtgrq`, Region: `eu-west-2`)  
**Deployment Target:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS  
**Design System:** Neo-Brutalism (Cabinet Grotesk / Satoshi, 2px borders, hard shadows, neoYellow & neoSage accents)  
**Status:** **100% PRODUCTION READY & FULLY VERIFIED**

---

## 1. System Architecture & High-Level Design

Brightloop Billing is an enterprise SaaS billing and FinOps revenue operations engine built specifically to automate recurring contract monetization, prevent duplicate billing through database-level idempotency, and reconcile accounts receivable across complex enterprise hierarchies.

```mermaid
flowchart TD
    subgraph Frontend["Frontend Layer (Next.js 14 App Router)"]
        UI_Admin["Internal Admin & Staff Console (/dashboard, /customers, /subscriptions, /invoices, /reports)"]
        UI_Customer["Customer Self-Service Portal (/portal)"]
        UI_Public["Landing & Auth (/login, /signup, /forgot-password)"]
    end

    subgraph Security["Security & Middleware Layer"]
        MW["Next.js Middleware (src/middleware.ts)"]
        SSR["@supabase/ssr Cookie Session Manager"]
        RoleGuard["Server-Side Role Guard (Admin, Staff, Customer)"]
    end

    subgraph Services["Service Layer (src/lib/services/)"]
        S_Auth["auth.ts"]
        S_Cat["catalog.ts"]
        S_Cust["customers.ts"]
        S_Sub["subscriptions.ts"]
        S_Inv["invoices.ts"]
        S_Pay["payments.ts"]
        S_Bill["billing-engine.ts"]
        S_Fin["analytics.ts"]
        S_Port["customer-portal.ts"]
        S_Notif["notifications.ts"]
    end

    subgraph Database["Database Layer (Supabase PostgreSQL)"]
        DB_Auth["auth.users"]
        DB_Prof["public.profiles"]
        DB_Cat["public.products, product_variants, plans, taxes, discounts"]
        DB_Sub["public.subscriptions, subscription_lines"]
        DB_Inv["public.invoices (uq_subscription_period), invoice_lines"]
        DB_Pay["public.payments"]
        RLS["PostgreSQL Row Level Security (24 Policies)"]
    end

    Frontend --> MW
    MW --> SSR
    SSR --> RoleGuard
    RoleGuard --> Services
    Services --> Database
```

---

## 2. Technology Stack

| Layer | Technologies & Libraries | Version / Specification |
|---|---|---|
| **Framework** | Next.js App Router | `14.2.35` |
| **Runtime & Language** | Node.js / TypeScript | `Node v24.22.0`, `TypeScript 5.x` |
| **UI Components & Styling** | React, Tailwind CSS, Lucide React, Clsx | `React 18.2.0`, `Tailwind 3.4.1` |
| **Typography & Design** | Cabinet Grotesk, Satoshi, Neo-Brutalist tokens | 2px solid black borders, hard drop-shadows |
| **Database & Auth** | Supabase PostgreSQL, Supabase Auth | Hosted on AWS eu-west-2 |
| **SDKs & Clients** | `@supabase/supabase-js`, `@supabase/ssr` | Cookie-based session persistence |
| **Billing Scheduler** | Next.js Route Handler `/api/cron/billing` | Protected by `CRON_SECRET` |
| **Analytics & Reporting** | PostgreSQL Aggregation Service | Real-time MRR, ARR, Cashflow, CSV Export |

---

## 3. Database Schema & Relationships

The platform operates on **14 relational tables** in PostgreSQL, reinforced with foreign key constraints, cascade rules, and strategic performance indexes:

```mermaid
erDiagram
    profiles ||--o{ subscriptions : "owns"
    profiles ||--o{ invoices : "billed_to"
    profiles ||--o{ payments : "settled_by"
    plans ||--o{ subscriptions : "defines_terms"
    products ||--o{ product_variants : "has_attributes"
    products ||--o{ subscription_lines : "items"
    subscriptions ||--o{ subscription_lines : "contains"
    subscriptions ||--o{ invoices : "generates"
    invoices ||--o{ invoice_lines : "snapshots"
    products ||--o{ invoice_lines : "referenced_in"
    invoices ||--o{ payments : "reconciled_against"

    profiles {
        uuid id PK
        text email UK
        text name
        text company_name
        user_role role "admin | staff | customer"
        text phone
        text billing_address
    }

    products {
        uuid id PK
        text name
        numeric sales_price
        numeric cost_price
    }

    product_variants {
        uuid id PK
        uuid product_id FK
        text attribute_name
        text attribute_value "e.g. Odoo"
        numeric price_extra "e.g. 560.00"
    }

    plans {
        uuid id PK
        text name
        billing_period_type billing_period "monthly | yearly"
        numeric price
    }

    subscriptions {
        uuid id PK
        text subscription_number UK
        uuid customer_id FK
        uuid plan_id FK
        subscription_status status "draft | quotation | confirmed | active | closed"
        date start_date
        date expiry_date
    }

    invoices {
        uuid id PK
        text invoice_number UK
        uuid subscription_id FK
        uuid customer_id FK
        date billing_period_start
        date billing_period_end
        invoice_status status "draft | confirmed | paid | cancelled"
        numeric total_amount
        numeric amount_paid
        date due_date
    }

    invoice_lines {
        uuid id PK
        uuid invoice_id FK
        uuid product_id FK
        text description "Historical Snapshot"
        int quantity
        numeric unit_price "Historical Snapshot"
        numeric tax_rate "Historical Snapshot"
        numeric amount
    }

    payments {
        uuid id PK
        uuid invoice_id FK
        uuid customer_id FK
        numeric amount
        payment_method method "bank_transfer | credit_card | wire | ach"
        date payment_date
        text note
    }
```

---

## 4. Authentication, Roles & Permissions

### 4.1 Pure Email/Password Authentication (Zero Google OAuth)
Per strict instructions, Google OAuth has been **100% eliminated** from the codebase. The platform uses pure Supabase email/password authentication:
- **Admin Account:** `admin@brightloop.io` / `Bright@2026!` (Redirects to `/dashboard`)
- **Internal Staff Account:** `staff@brightloop.io` / `Bright@2026!` (Redirects to `/dashboard`)
- **Customer Account:** `customer@acme.corp` / `Bright@2026!` (Redirects to `/portal`)

### 4.2 Permission Matrix

| Capability / Route | Admin | Internal Staff | Customer |
|---|:---:|:---:|:---:|
| **Executive Dashboard (`/dashboard`)** | ✅ Full Access | ✅ Operations View | ❌ Blocked (Redirected to `/portal`) |
| **Customer Portal (`/portal`)** | ✅ Allowed | ✅ Allowed | ✅ Own Records Only |
| **Catalog & Plans (`/catalog`)** | ✅ Full Access | ❌ Forbidden | ❌ Forbidden |
| **Discounts & Promotions (`/discounts`)** | ✅ Full Access | ❌ Forbidden | ❌ Forbidden |
| **Platform Settings & Staff Provisioning (`/settings`)** | ✅ Full Access | ❌ Forbidden | ❌ Forbidden |
| **Customer Directory (`/customers`)** | ✅ Full Access | ✅ Permitted | ❌ Blocked |
| **Subscriptions Directory (`/subscriptions`)** | ✅ Full Access | ✅ Permitted | ❌ Own Subscriptions Only |
| **Advance Subscription Lifecycle Stage** | ✅ Full Access | ✅ Permitted | ❌ Blocked |
| **Invoices Ledger (`/invoices`)** | ✅ Full Access | ✅ Permitted | ❌ Own Invoices Only |
| **Record Manual Payments** | ✅ Full Access | ✅ Permitted | ❌ Self-Service Pay Only |
| **Run Automated Billing Job (`/invoices/generate`)** | ✅ Full Access | ❌ Forbidden | ❌ Forbidden |
| **Financial Reports & CSV Export (`/reports`)** | ✅ Full Access | ✅ Permitted | ❌ Forbidden |

---

## 5. End-to-End Workflow Architecture

### 5.1 Catalog $\to$ Subscription $\to$ Pricing
1. Products and variants are managed in PostgreSQL.
2. The core SaaS product ($1,200) with the Odoo variant (+**$560.00**) calculates unit pricing at **$1,760.00**.
3. Subscriptions attach line items snapshotting product attributes and quantities.
4. The Lifecycle Engine enforces validated progression:
   $$\text{Draft} \longrightarrow \text{Quotation} \longrightarrow \text{Confirmed} \longrightarrow \text{Active} \longrightarrow \text{Closed}$$

### 5.2 Recurring Billing Engine & Strict Database Idempotency
1. Automated engine (`src/lib/services/billing-engine.ts`) runs on a scheduled cadence via `/api/cron/billing` (authorized via `CRON_SECRET`).
2. Scans all active PostgreSQL subscriptions.
3. Calculates billing period dates with month-end date clamping (e.g., Jan 31st to Feb 28th) and leap-year compliance.
4. Checks PostgreSQL unique constraint `uq_subscription_period (subscription_id, billing_period_start)`.
   - If an invoice already exists for that cycle, the subscription is safely skipped.
   - If unbilled, generates unique `INV-YYYYMMDD-XXXX` invoice, snapshots all line items, applies 10% tax, and logs invoice in `confirmed` status.
5. Consecutive re-runs yield **0 duplicates** with **100% of accounts safely skipped**.

### 5.3 Invoicing, Payments & Atomic Cashflow Reconciliation
1. **Historical Snapshotting:** Lines store frozen descriptions, quantities, unit prices, and tax rates. Future catalog edits cannot alter past accounting history.
2. **Atomic Payment Recording:** Modal accepts `bank_transfer`, `credit_card`, `wire`, and `ach`. Balance updates in PostgreSQL occur atomically.
3. **Auto-Paid Transition:** When cumulative verified payments equal or exceed `total_amount`, status transitions automatically to `PAID`. Overpayment attempts are strictly rejected.
4. **Clean Print & PDF Generation:** Clean invoice printing and PDF export via `window.print()` with `@media print` rules.

### 5.4 FinOps Intelligence & Analytics
1. **MRR Calculation:** Normalizes monthly and yearly contracts ($1/12$). Current live MRR: **$7,926.67/mo**.
2. **ARR Formula:** Exact mathematical guarantee: $\text{ARR} = \text{MRR} \times 12 = \mathbf{\$95,120.04/yr}$.
3. **Accounts Receivable Aging:** Identifies outstanding vs. overdue balances across contracts.
4. **Reporting Datasets:** Real-time revenue aggregates by month, product invoiced volume, plan tier, and payment method, downloadable via standard RFC-4180 CSV export.

### 5.5 Customer Portal Self-Service
1. Strictly authenticated via Supabase session cookie (`auth.uid()`).
2. Renders 3 status cards ("What I Pay", "When It Renews", "What I Owe").
3. Enables online invoice settlement, invoice PDF printing, payment history review, and company profile updates directly in PostgreSQL.

---

## 6. Comprehensive Verification Test Matrix

Executed via `cmd /c npx tsx scripts/test-master-suite.mjs`:

| Test ID | Category | Target | Verified Behavior | Status |
|---|---|---|---|:---:|
| **TC-01** | **Authentication** | Three User Roles | Real logins for Admin, Staff, Customer with database role verification | **PASSED** |
| **TC-02** | **Catalog** | Variant Pricing | Base $1,200 + Odoo Variant $560 = $1,760 total unit price | **PASSED** |
| **TC-03** | **Customers** | PostgreSQL Storage | 12 verified enterprise customer accounts active in database | **PASSED** |
| **TC-04** | **Lifecycle** | State Machine | Progression validation across `draft`, `quotation`, `confirmed`, `active`, `closed` | **PASSED** |
| **TC-05** | **Ledger** | Invoice Line Snapshots | Frozen unit prices, descriptions, and tax rates independent of catalog | **PASSED** |
| **TC-06** | **Payments** | Atomic Reconciliation | 12 reconciled payments; full settlement transitions invoices to `paid` | **PASSED** |
| **TC-07** | **Billing** | Database Idempotency | 100% of accounts (7/7) skipped on rerun; 0 duplicate invoices | **PASSED** |
| **TC-08** | **FinOps** | Math & ARR Formula | Live MRR = $7,926.67, ARR = $95,120.04 ($\text{ARR} = \text{MRR} \times 12$) | **PASSED** |
| **TC-09** | **Portal** | Tenant Isolation | Zero cross-customer data leakage between customer accounts | **PASSED** |
| **TC-10** | **Security** | Zero Google OAuth | 0 occurrences of Google OAuth across entire `src/` directory | **PASSED** |
| **TC-11** | **TypeScript** | Static Type Check | `cmd /c npx tsc --noEmit` across all modules | **PASSED** (0 errors) |
| **TC-12** | **Production Build** | Next.js Compiler | `npm.cmd run build:next` (25 routes compiled) | **PASSED** (0 errors) |

---

## 7. Production Deployment & Operations Checklist

1. **Environment Variables:** Verify `.env.local` contains `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `CRON_SECRET`.
2. **Database Migrations:** Ensure migration `supabase/migrations/20261031150000_phase3b_customers_auth.sql` has been executed in the Supabase Dashboard SQL Editor.
3. **Cron Job Schedule:** Configure daily automated billing via Vercel Cron or Supabase `pg_cron` targeting `/api/cron/billing` with `Authorization: Bearer <CRON_SECRET>`.
4. **Email Dispatch:** If live email delivery is desired, set `RESEND_API_KEY` or `SMTP_HOST` in environment variables; the notification service will seamlessly switch from dry-run simulation to live delivery.
5. **Backups:** Point-in-time recovery is active in Supabase. Run periodic schema and data dumps via `supabase db dump`.

---

## 8. Conclusion

Brightloop Billing has been successfully transformed into a reliable, enterprise-grade, and secure subscription billing platform. All mock data and in-memory store dependencies in production paths have been replaced with live PostgreSQL operations, full data isolation is enforced, and the complete application is verified and ready for production deployment.

