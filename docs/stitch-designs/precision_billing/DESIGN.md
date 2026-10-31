---
name: Precision Billing
colors:
  surface: '#fbf8ff'
  surface-dim: '#d9d9e7'
  surface-bright: '#fbf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f2ff'
  surface-container: '#ededfb'
  surface-container-high: '#e7e7f5'
  surface-container-highest: '#e1e1f0'
  on-surface: '#191b25'
  on-surface-variant: '#464554'
  inverse-surface: '#2e303b'
  inverse-on-surface: '#f0effe'
  outline: '#767585'
  outline-variant: '#c7c5d6'
  surface-tint: '#4a4dce'
  primary: '#3b3dc0'
  on-primary: '#ffffff'
  primary-container: '#5558d9'
  on-primary-container: '#e8e6ff'
  inverse-primary: '#c0c1ff'
  secondary: '#4d50c2'
  on-secondary: '#ffffff'
  secondary-container: '#868aff'
  on-secondary-container: '#171592'
  tertiary: '#005d3c'
  on-tertiary: '#ffffff'
  tertiary-container: '#00784f'
  on-tertiary-container: '#99fdc9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#06006c'
  on-primary-fixed-variant: '#3131b6'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#05006c'
  on-secondary-fixed-variant: '#3436a9'
  tertiary-fixed: '#93f6c3'
  tertiary-fixed-dim: '#77daa8'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005235'
  background: '#fbf8ff'
  on-background: '#191b25'
  surface-variant: '#e1e1f0'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.015em
  metric-display:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.03em
  title-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.01em
  body-default:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-medium:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-default:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  data-mono:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style
The design system embodies the clinical precision of modern enterprise infrastructure paired with the calm, focused execution of contemporary developer tooling. It caters to finance leaders, revenue operations leads, and founders managing high-velocity subscription models. 

The aesthetic is grounded in **Corporate Minimalist Precision**:
- High-utility clarity with disciplined structural density.
- Quiet, purposeful surfaces that allow mission-critical figures, churn indicators, and contract lifecycles to command immediate visual hierarchy.
- Rejection of gratuitous decoration in favor of crisp hairline borders, balanced negative space, and calculated contrast.
- Visual confidence inspired by high-reliability fintech interfaces, where operational reliability and absolute accuracy are paramount.

## Colors
The color architecture relies on a deliberate balance between a cool architectural neutral scale and high-context status pigments:

- **Canvas & Surfaces**: The application canvas rests on a soft foundational gray (`#F7F8FA`). Elevated modules, analytical panels, and records use pure white (`#FFFFFF`) to establish crisp contrast against the background.
- **Brand & Action**: The primary action system uses an assertive Indigo (`#5558D9`), deepening to `#4346B8` on interactive hover. It is reserved exclusively for intentional operations (primary CTA, active navigation anchors, selection indicators).
- **Typography & Structure**: Headings and primary numerical values leverage rich carbon black (`#171923`), with secondary metadata, timestamps, and column labels set in muted slate (`#737887`). Structural dividers and element enclosures use an exact hairline tone (`#E8EAF0`).
- **Semantic Feedback**: 
  - **Success / Healthy**: `#16865B` paired with light mint backdrops (`#EDF7F2`) for active subscriptions, paid invoices, and positive cohort deltas.
  - **Warning / Review Needed**: `#D99A35` on soft amber (`#FEF7EC`) for trials ending, grace periods, and pending renewals.
  - **Danger / Critical**: `#D94F55` on washed rose (`#FDF1F2`) for involuntary churn, dunning failures, and delinquent accounts.

## Typography
The typography balances structural authority with numerical legibility:
- **Headings & Financial Displays**: Set in **Geist** with tight negative tracking (`-0.02em` to `-0.03em`) for a sharp, technical presence in executive summaries and high-level KPI tiles.
- **Interface & Operational Reading**: Set in **Inter** for neutral, effortless legibility across dense data tables, multi-column forms, and billing timelines.
- **Tabular Numerics**: All financial figures, pricing tiers, invoice sums, and metrics must enforce `font-variant-numeric: tabular-nums` to guarantee vertical decimal alignment across row comparisons and currency denominations (such as INR ₹ or USD $).
- **Hierarchy Scale**:
  - `metric-display` (28px / 600) drives primary dashboard stat cards (e.g., MRR, ARR, Net Revenue Retention).
  - `label-caps` (11px / 600 uppercase) is reserved strictly for table headers, metadata descriptors, and card overlines.
  - `data-mono` provides crisp alignment for identifiers, API keys, and ledger timestamps.

## Layout & Spacing
The layout follows a desktop-first, modular administrative framework:
- **Grid Architecture**: Standard 12-column fluid grid system across an enclosed maximum width of `1440px`. Column gutters remain compact (`1rem` on tablet, scaling to `1.5rem` on wide desktop workstations) to maintain high data visibility without excessive vertical travel.
- **Rhythm & Multiples**: Every gap, interior component padding, and stack layout strictly honors a 4px/8px structural base.
  - `space-xs` (4px): Micro-gaps between badge status dots and text labels; segmented pill padding.
  - `space-sm` (8px): Icon-to-label inline gaps; form control interior vertical padding; compact table cell padding.
  - `space-md` (12px): Standard button horizontal padding; form control row spacing.
  - `space-lg` (16px): Content card interior padding; data table horizontal cell offsets.
  - `space-xl` (24px): Card module separation; stat grid gaps; view header bottom margins.
- **Adaptability**:
  - **Desktop (≥1200px)**: Persistent collapsible vertical navigation (240px default / 64px icon-only), multi-pane filter shelves, and expanded tabular data columns.
  - **Tablet (768px - 1199px)**: Top bar navigation takeover, tables shift to horizontally scrollable viewports with locked frozen key columns (Customer/ID).
  - **Mobile (<768px)**: KPI blocks collapse into single-column vertical stacks; complex data matrices convert to structured summary cards.

## Elevation & Depth
Depth is produced through subtle structural boundaries and ambient atmospheric shadows, avoiding muddy or heavy drops:

- **Surface Tiers**:
  - **Tier 0 (Base)**: `#F7F8FA` application canvas.
  - **Tier 1 (Cards & Data Grids)**: `#FFFFFF` resting directly on Tier 0, enclosed by a 1px solid border (`#E8EAF0`) and anchored by a micro ambient drop shadow: `0 1px 3px rgba(0, 0, 0, 0.04)`.
  - **Tier 2 (Popovers, Filter Menus, Flyouts)**: Elevated floating planes using `0 4px 16px -2px rgba(0, 0, 0, 0.08)`, framed by a crisp border (`#E8EAF0`).
  - **Tier 3 (Modals & Confirmation Drawers)**: Heavy focal elevation with `0 12px 32px -4px rgba(0, 0, 0, 0.12)`, supported by a tinted backdrop scrim (`rgba(23, 25, 35, 0.4)` with 4px backdrop blur).
- **Hairline Layering**: Visual grouping relies heavily on 1px dividers rather than drastic depth elevation, maintaining an uncluttered, high-information-density workspace.

## Shapes
The shape language uses calibrated 8px to 12px radii (`roundedness: 2`), balancing clean geometric structure with soft modern UI curves:

- **Inputs, Buttons, Dropdowns**: Standard 8px (`0.5rem`) corner radius. This delivers neat alignment against 36px and 40px component heights.
- **Cards, Panels, Modal Containers**: Elevated containers use 12px (`0.75rem`) corner rounding to subtly delineate larger analytical regions without appearing playful or oversized.
- **Status Pills & Segmented Tabs**: Badges, status markers, and segmented toggle sliders utilize an intentional full-pill geometry (`9999px`) to create immediate visual differentiation between active interactive controls and passive status displays.

## Components

### Buttons
- **Primary**: Background `#5558D9`, foreground `#FFFFFF`, border none. Hover state `#4346B8`. Focused with a 2px offset ring (`rgba(85, 88, 217, 0.35)`). Active state scales slightly down (`scale(0.98)`).
- **Secondary / Outline**: Background `#FFFFFF`, text `#171923`, border 1px solid `#E8EAF0`. Hover state triggers background `#F7F8FA` with border tint `#D8DAE2`.
- **Tertiary / Ghost**: Transparent background, text `#737887`. Hover transitions to text `#171923` with `#F0F2F6` background fill.
- **Destructive**: Background `#FFFFFF`, text `#D94F55`, border 1px solid `#F8D7DA`. Hover fills with `#FDF1F2`.

### Status Badges & Pills
- Pill-shaped (`rounded-full`), `space-xs` vertical padding, `space-sm` horizontal padding, `label-default` font sizing.
- **Active / Paid**: Background `#EDF7F2`, text `#16865B`, hairline border `rgba(22, 134, 91, 0.2)`. Features a 6px solid green indicator dot.
- **Pending / Due**: Background `#FEF7EC`, text `#D99A35`, hairline border `rgba(217, 154, 53, 0.2)`. Features an amber indicator dot.
- **Overdue / Canceled**: Background `#FDF1F2`, text `#D94F55`, hairline border `rgba(217, 79, 85, 0.2)`. Features a red indicator dot.

### Data Tables
- Container framed with 1px `#E8EAF0` border and 12px radius.
- **Header Row**: Background `#F7F8FA`, height 36px, text styled in `label-caps` (`#737887`), bottom border 1px solid `#E8EAF0`.
- **Data Rows**: Height 48px, background `#FFFFFF`, alternating hover effect (`#FBFBFC`), bottom border 1px solid `#F0F2F6`. Numeric data aligned right with `tabular-nums`. Action menus pinned to the right edge via ghost icon buttons.

### Financial Stat Cards
- Enclosed white panel with 12px radius, 1px `#E8EAF0` border, `space-lg` interior padding.
- Upper region contains the title (`label-caps` in `#737887`) paired with a neutral context action (e.g., date range dropdown or tooltip).
- Core region displays the financial metric using `metric-display` in `#171923`.
- Lower region features delta trends: inline pill containing directional icon + percentage (e.g., `+12.4%` in green `#16865B` or `-3.2%` in red `#D94F55`), followed by a secondary descriptor (`vs last month` in `#737887`).

### Input Fields & Filter Bars
- Height 36px (compact) or 40px (default). Background `#FFFFFF`, border 1px solid `#E8EAF0`, radius 8px, text `body-default`.
- Placeholder text in `#A0A4B0`. Active focus rings shift border to `#5558D9` with a subtle box-shadow bloom: `0 0 0 3px rgba(85, 88, 217, 0.12)`.
- **Filter Bar**: Unified horizontal cluster containing search query input, segmented date-range pill toggles, and multi-select property filter dropdowns enclosed in a cohesive border group.

### Checkboxes & Segmented Controls
- **Checkboxes**: 16x16px rounded-square (4px radius). Unchecked border 1px solid `#D8DAE2`. Checked fills with `#5558D9` displaying a crisp `#FFFFFF` check vector.
- **Segmented Tabs**: Enclosed pill container (`#F0F2F6`, 4px interior padding). Active tab slides with a white surface (`#FFFFFF`), 6px radius, subtle drop shadow (`0 1px 2px rgba(0, 0, 0, 0.06)`), and `#171923` text. Inactive tabs use transparent fill with `#737887` text.