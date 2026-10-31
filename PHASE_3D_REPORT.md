# Brightloop Billing — Phase 3D: Recurring Billing Engine & Automation Report

**Date:** 2026-10-31  
**Project:** Brightloop Billing (`C:\Users\Admin\Documents\odoo-FLUX`)  
**Database:** Hosted PostgreSQL on Supabase (`brightloop-billing`, Ref: `wjbmmmejfunghtpmtgrq`, Region: `eu-west-2`)  
**Phase:** 3D — Recurring Billing and Automation  
**Status:** **IMPLEMENTED, VERIFIED & TESTED**

---

## 1. Executive Summary

Phase 3D replaces the in-memory client simulation of automated billing with a production-grade, database-driven recurring billing engine. The engine scans all active subscriptions in PostgreSQL, snapshots accurate line items, respects variant adjustments (+$560 Odoo variant), enforces standard 10% tax, generates unique invoice numbers, and dispatches notification events.

### Key Accomplishments Delivered:
1. **PostgreSQL Recurring Billing Engine (`src/lib/services/billing-engine.ts`):**
   - Automatically processes all active customer subscriptions.
   - Calculates monthly and yearly periods with month-end date clamping (e.g., Jan 31st to Feb 28th) and leap-year compliance.
   - Snapshots subscription lines into `invoice_lines` with frozen descriptions, quantities, and pricing.
2. **Guaranteed Database Idempotency:**
   - Enforces PostgreSQL unique constraint `uq_subscription_period` on `(subscription_id, billing_period_start)`.
   - Verified that running the billing engine consecutively produces **0 duplicates** with **100% of already-billed accounts safely skipped**.
3. **Scheduled Cron Endpoint (`/api/cron/billing`):**
   - Secure server-only endpoint supporting automated execution by external schedulers (e.g. Vercel Cron, Supabase pg_cron, GitHub Actions).
   - Protected by `CRON_SECRET` authorization header (`Bearer <token>` or `x-cron-secret`).
   - Returns structured JSON payload with execution durations, created counts, skipped counts, and error arrays.
4. **Interactive UI Run Page (`/invoices/generate`):**
   - Live query of eligible active subscriptions from PostgreSQL.
   - Real-time batch progress indicator.
   - Detailed execution summary with created invoice numbers, contract numbers, and totals.
5. **Notification Service Abstraction (`src/lib/services/notifications.ts`):**
   - Clean provider interface for customer notifications (`invoice_created`, `upcoming_due_date`, `invoice_overdue`, `payment_confirmed`).
   - Safe dry-run simulated provider when external SMTP or Resend credentials are not configured, with masked recipient logging to protect customer privacy.

---

## 2. Technical Architecture & Scheduling Setup

### 2.1 Billing Workflow
```mermaid
flowchart TD
    Scheduler["Scheduler (pg_cron / Vercel Cron / UI Run)"] -->|POST with CRON_SECRET| CronEndpoint["/api/cron/billing"]
    CronEndpoint --> BillingEngine["src/lib/services/billing-engine.ts"]
    BillingEngine -->|Query Active| DBSub["PostgreSQL subscriptions (status = 'active')"]
    BillingEngine -->|Check Period Exists| DBInvCheck{"Invoice Exists for (sub_id, period_start)?"}
    DBInvCheck -->|Yes| Skip["Skip Account (Idempotent)"]
    DBInvCheck -->|No| CreateInv["Insert Invoice & Snapshot Lines"]
    CreateInv --> DBInv["PostgreSQL public.invoices & invoice_lines"]
    CreateInv --> Notif["notificationService.send(invoice_created)"]
    BillingEngine --> ReturnSummary["Return Execution Statistics"]
```

### 2.2 Production Scheduler Configuration
To schedule automatic daily billing in production:
- **Environment Variable:** Set `CRON_SECRET=your_super_secret_token` in `.env.local` / hosting platform.
- **Vercel Cron (`vercel.json`):**
  ```json
  {
    "crons": [
      {
        "path": "/api/cron/billing",
        "schedule": "0 0 * * *"
      }
    ]
  }
  ```
- **External Webhook / Curl:**
  ```bash
  curl -X POST https://your-domain.com/api/cron/billing \
    -H "Authorization: Bearer your_super_secret_token"
  ```

---

## 3. Verification & Test Execution Matrix

Executed via `cmd /c npx tsx scripts/test-phase3d.mjs`:

| Test ID | Test Description | Expected Result | Status |
|---|---|---|:---:|
| **TC-3D-01** | Date Math & Month-End Clamping | Jan 31 rolls to Feb 28 (non-leap) and Feb 29 on leap years | **PASSED** |
| **TC-3D-02** | Notification Service Abstraction | Dispatches dry-run simulation without exposing secrets | **PASSED** |
| **TC-3D-03** | Live Billing Run Execution | Bills 7 active PostgreSQL subscriptions | **PASSED** (7 invoices created, 0 failed, 12.5s) |
| **TC-3D-04** | Strict Idempotency Check | 100% of accounts skipped on immediate re-run | **PASSED** (0 created, 7 skipped, 0 duplicates) |
| **TC-3D-05** | TypeScript Check | `cmd /c npx tsc --noEmit` | **PASSED** (0 errors) |

---

## 4. Files Created and Modified

### Created Files:
- `src/lib/services/billing-engine.ts` — PostgreSQL recurring billing engine with date math and snapshotting.
- `src/lib/services/notifications.ts` — Notification service abstraction with dry-run fallback.
- `scripts/test-phase3d.mjs` — Automated verification test suite for Phase 3D.
- `PHASE_3D_REPORT.md` — Deliverable documentation.

### Modified Files:
- `src/app/api/cron/billing/route.ts` — Updated to execute real database billing engine with `CRON_SECRET` authorization.
- `src/app/actions/invoices.ts` — Added `executeBillingRunAction` server action.
- `src/app/invoices/generate/page.tsx` — Migrated to live database execution, progress animation, and audit summary.

---

## 5. Remaining In-Memory Dependencies & Next Phase Readiness

### Remaining in `store.ts`:
- Operational analytics and dashboard metrics on `/dashboard` (Phase 3E).
- Customer portal views on `/portal` (Phase 3F).

### Next Phase:
**PHASE 3E: REAL-TIME DASHBOARD, METRICS AND ANALYTICS**
- Replace demo dashboard metrics with live PostgreSQL queries.
- Compute Monthly Recurring Revenue (MRR), Annual Recurring Revenue (ARR = $12 \times \text{MRR}$), and Active Contracts.
- Build reporting service with revenue breakdowns by plan, product, and payment method.
- Add CSV export support.

