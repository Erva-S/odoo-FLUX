# Brightloop Billing — Design System & Architecture Notes

## 1. Design System: Modern Neo-Brutalism
- **Philosophy**: Professional confidence with a playful edge. High-contrast solid black outlines, flat offsets (zero blur), vibrant yellow accents, geometric typography, tactile physical push buttons.
- **Strict Rules**:
  - Exactly `2px solid #000000` border on all cards, buttons, inputs, tables, badges, and sections.
  - Hard shadows with 0 blur:
    - Standard: `4px 4px 0 0 #000000`
    - Large containers: `8px 8px 0 0 #000000`
    - Browser mockup windows: `12px 12px 0 0 #000000`
  - Push button hover/active: `translate(4px, 4px)` with shadow removed (`0 0 0 #000`), spring transition `cubic-bezier(0.175, 0.885, 0.32, 1.275)`.
  - Radii: Buttons/inputs 8px–12px; Panels 12px–16px; Badges pill (`9999px`).
  - Branded fills strictly limited to `#ffe17c` (Primary Yellow), `#171e19` (Charcoal), `#b7c6c2` (Sage).
  - Canvas surface `#f4f4f5` for readable data-heavy screens; `#272727` for dark cards and dividers.
  - 32px x 32px radial dot pattern at 10% opacity only on yellow hero/banner areas.

## 2. Tokens & CSS Variables

```css
:root {
  --color-primary-yellow: #ffe17c;
  --color-charcoal: #171e19;
  --color-sage: #b7c6c2;
  --color-white: #ffffff;
  --color-black: #000000;
  
  --color-canvas: #f4f4f5;
  --color-surface-dark: #272727;
  --color-border-divider: #e4e4e7;
  
  /* Status Accent Tokens */
  --status-green: #28c840;
  --status-amber: #febc2e;
  --status-red: #ff5f57;
  
  /* Shadows */
  --shadow-hard-sm: 2px 2px 0 0 #000000;
  --shadow-hard: 4px 4px 0 0 #000000;
  --shadow-hard-lg: 8px 8px 0 0 #000000;
  --shadow-hard-xl: 12px 12px 0 0 #000000;
  
  /* Radii */
  --radius-btn: 10px;
  --radius-input: 8px;
  --radius-panel: 14px;
  --radius-mockup: 16px;
  --radius-pill: 9999px;
}
```

## 3. Tailwind Configuration Theme

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        neoYellow: '#ffe17c',
        neoCharcoal: '#171e19',
        neoSage: '#b7c6c2',
        neoCanvas: '#f4f4f5',
        neoDark: '#272727',
        neoStatusGreen: '#28c840',
        neoStatusAmber: '#febc2e',
        neoStatusRed: '#ff5f57',
      },
      boxShadow: {
        'neo-sm': '2px 2px 0 0 #000000',
        'neo': '4px 4px 0 0 #000000',
        'neo-lg': '8px 8px 0 0 #000000',
        'neo-xl': '12px 12px 0 0 #000000',
      },
      fontFamily: {
        heading: ['Cabinet Grotesk', 'system-ui', 'sans-serif'],
        body: ['Satoshi', 'system-ui', 'sans-serif'],
      },
      borderWidth: {
        '2': '2px',
        '3': '3px',
      }
    }
  }
}
```

## 4. Components Catalog
1. **NeoButton**:
   - `primary`: bg `#000`, text `#fff`, 2px solid border, shadow `4px 4px 0 #000`. Hover/active: `translate(4px, 4px)`, shadow-none.
   - `secondary`: bg `#fff`, text `#000`, 2px solid border, shadow `4px 4px 0 #000`.
   - `destructive`: bg `#ff5f57`, text `#000`, 2px solid border, shadow `4px 4px 0 #000`.
   - `hero`: bg `#000`, text `#fff`, shadow `8px 8px 0 #000`, hover: `translate(4px, 4px)` with 4px shadow.
2. **NeoInput**:
   - bg `#fff`, 2px black border, 8px radius, focus shadow `4px 4px 0 #000`, focus ring 3px black outline offset 2px. Error: red border `#ff5f57` with helper text.
3. **NeoBadge (Pill)**:
   - 2px black border, text label.
   - Active / Paid: `#28c840` (green).
   - Confirmed / Quotation: `#b7c6c2` (sage).
   - Draft: `#f4f4f5` (dashed 2px border).
   - Due Soon / Paused: `#febc2e` (amber).
   - Overdue / Cancelled: `#ff5f57` (red).
   - Closed: `#272727` with white text.
4. **NeoCard / NeoPanel**:
   - bg `#fff` or `#171e19`, 2px black border, 4px shadow (8px for large metrics panels).
5. **MockupWindow**:
   - bg `#fff`, 2px black border, 16px radius, 12px hard shadow. Black top bar with three dot controls (`#ff5f57`, `#febc2e`, `#28c840`).
6. **LifecycleRail**:
   - Charcoal `#171e19` container. 5 stages: Draft -> Quotation -> Confirmed -> Active -> Closed. Completed in sage, active in vibrant yellow with badge, future in `#272727`. Single primary next action push button.
7. **NeoTable**:
   - Sticky black header with white bold text, 2px light gray `#e4e4e7` row dividers, tabular numbers, row hover fill `#ffe17c`.
8. **NeoToast**:
   - bg `#fff`, 2px black border, 4px shadow, bottom-right slide-in.

---

## 5. ASCII Wireframes

### A. Finance Dashboard
```text
+----------------------------------------------------------------------------------------------------+
|  [B] BRIGHTLOOP BILLING   | Search anything... [Q] | + New [v]  | [Filter: All Time | Acme | Plan] [Admin v] |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  How much is owed, and by whom?                                [ Detail / Summary Toggle ]         |
|                                                                                                    |
|  +---------------------------------------+  +---------------------------------------------------+  |
|  | REVENUE COLLECTED vs OWED (8px shadow)|  | REVENUE & ACTIVE SUBS TREND                       |  |
|  | Collected: $184,250.00 [92%]          |  |  $$ |   _   _   _   _   _                         |  |
|  | Still Owed: $16,420.00  [ 8%]         |  |     |  | | | | | | | | | |                        |  |
|  | Overdue:    $6,800.00   (4 accounts)  |  |     |  |_| |_| |_| |_| |_| (Charcoal & Sage bars) |  |
|  | Active Subscriptions: 284             |  |     +-------------------------                    |  |
|  +---------------------------------------+  +---------------------------------------------------+  |
|                                                                                                    |
|  OVERDUE INVOICES WORKING AREA (14 OVERDUE)                          [ Search by customer/invoice ]|
|  +----------------------------------------------------------------------------------------------+  |
|  | INVOICE   | CUSTOMER         | PLAN           | DUE DATE       | AMOUNT     | ACTION         |  |
|  +-----------+------------------+----------------+----------------+------------+----------------+  |
|  | INV-0492  | Wayne Enterprises| Enterprise Pro | 12 days ago(!) | $2,400.00  | [Record Paym.] |  |
|  | INV-0487  | Stark Industries | Startup Monthly| 8 days ago (!) | $560.00    | [Record Paym.] |  |
|  | INV-0471  | Cyberdyne LLC    | Scale Yearly   | 3 days ago (!) | $4,800.00  | [Record Paym.] |  |
|  +----------------------------------------------------------------------------------------------+  |
+----------------------------------------------------------------------------------------------------+
```

### B. Subscription Detail View (Memorable Screen)
```text
+----------------------------------------------------------------------------------------------------+
|  < Back to Subscriptions   | SUB-0042 — Acme Corp [ Scale Yearly ]                [Edit] [Cancel]  |
+----------------------------------------------------------------------------------------------------+
|  LEFT: LIFECYCLE RAIL (Charcoal Panel)   | RIGHT: LIVE PRINTABLE INVOICE PREVIEW                    |
|  +-------------------------------------+ | +-----------------------------------------------------+ |
|  |  ( ) 1. Draft         Oct 12, 2026 | | | [x][o][+] INV-0042-2026-10             [Print] [PDF] | |
|  |   |   (completed, Sage)             | | |-----------------------------------------------------| |
|  |  ( ) 2. Quotation     Oct 14, 2026 | | | BRIGHTLOOP SOFTWARE INC.           INVOICE #INV-0042 | |
|  |   |   (completed, Sage)             | | | Billed To: Acme Corp               Date: Oct 15, 2026| |
|  |  ( ) 3. Confirmed     Oct 15, 2026 | | | Attn: John Doe                     Due:  Nov 15, 2026| |
|  |   |   (completed, Sage)             | | |-----------------------------------------------------| |
|  |  (*) 4. ACTIVE        Oct 15, 2026 | | | Item                   Qty   Unit Price   Total     | |
|  |   |   (CURRENT STAGE: Yellow Pill)  | | | Cloud Platform Base     1    $1,200.00    $1,200.00 | |
|  |   |                                 | | | Brand Variant: Odoo     1      $560.00      $560.00 | |
|  |  ( ) 5. Closed        --            | | | Subtotal: $1,760.00 | Discount (10%): -$176.00      | |
|  |       (future: #272727)             | | | Tax (10%): $158.40  | TOTAL DUE: $1,742.40          | |
|  |                                     | | | Status: [ OUTSTANDING (Amber) ]                     | |
|  |  NEXT ACTION:                       | | +-----------------------------------------------------+ |
|  |  [ Close Subscription Push Button ]  | |                                                         |
|  +-------------------------------------+ |                                                         |
|                                                                                                    |
|  SUBSCRIPTION LINES (Configured Products & Pricing)                                                |
|  +----------------------------------------------------------------------------------------------+  |
|  | PRODUCT          | VARIANT        | QTY | UNIT PRICE | TAX RATE | LINE TOTAL                 |  |
|  | SaaS Core Engine | Odoo Brand     | 1   | $1,760.00  | 10% VAT  | $1,760.00                  |  |
|  +----------------------------------------------------------------------------------------------+  |
+----------------------------------------------------------------------------------------------------+
```

### C. Customer Portal View
```text
+----------------------------------------------------------------------------------------------------+
|  [B] BRIGHTLOOP | My Subscriptions  | My Invoices  | Account Settings                 [Jane Doe v] |
+----------------------------------------------------------------------------------------------------+
|  Welcome back, Jane (Acme Corp)                                                                    |
|                                                                                                    |
|  +----------------------+  +--------------------------+  +---------------------------------------+ |
|  | WHAT I PAY (Sage)    |  | WHEN IT RENEWS (Yellow)  |  | WHAT I OWE (White)                    | |
|  | $1,742.40 / year     |  | Nov 15, 2026             |  | $1,742.40                             | |
|  | Plan: Enterprise Pro |  | In 15 days (Auto-renew)  |  | 1 Outstanding Invoice                 | |
|  | [View Plan Details]  |  | [Manage Renewal]         |  | [ Pay Invoice Now Push Button ]       | |
|  +----------------------+  +--------------------------+  +---------------------------------------+ |
|                                                                                                    |
|  YOUR INVOICES                                                                                     |
|  +----------------------------------------------------------------------------------------------+  |
|  | INVOICE NUMBER | DATE ISSUED  | PERIOD           | AMOUNT    | STATUS         | ACTION       |  |
|  +----------------+--------------+------------------+-----------+----------------+--------------+  |
|  | INV-2026-0042  | Oct 15, 2026 | Oct 2026 - 2027  | $1,742.40 | [Outstanding]  | [Download]   |  |
|  | INV-2025-0019  | Oct 15, 2025 | Oct 2025 - 2026  | $1,500.00 | [Paid (Green)] | [Download]   |  |
|  +----------------------------------------------------------------------------------------------+  |
+----------------------------------------------------------------------------------------------------+
```

