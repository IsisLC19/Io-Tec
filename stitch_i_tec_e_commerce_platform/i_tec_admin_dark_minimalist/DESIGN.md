---
name: I-Tec Admin Dark Minimalist
colors:
  surface: '#131316'
  surface-dim: '#131316'
  surface-bright: '#39393c'
  surface-container-lowest: '#0e0e11'
  surface-container-low: '#1b1b1e'
  surface-container: '#1f1f22'
  surface-container-high: '#2a2a2d'
  surface-container-highest: '#353438'
  on-surface: '#e4e1e6'
  on-surface-variant: '#ccc3d8'
  inverse-surface: '#e4e1e6'
  inverse-on-surface: '#303033'
  outline: '#958da1'
  outline-variant: '#4a4455'
  surface-tint: '#d2bbff'
  primary: '#d2bbff'
  on-primary: '#3f008e'
  primary-container: '#7c3aed'
  on-primary-container: '#ede0ff'
  inverse-primary: '#732ee4'
  secondary: '#cebdff'
  on-secondary: '#381385'
  secondary-container: '#4f319c'
  on-secondary-container: '#bea8ff'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#007650'
  on-tertiary-container: '#76ffc2'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#eaddff'
  primary-fixed-dim: '#d2bbff'
  on-primary-fixed: '#25005a'
  on-primary-fixed-variant: '#5a00c6'
  secondary-fixed: '#e8ddff'
  secondary-fixed-dim: '#cebdff'
  on-secondary-fixed: '#21005e'
  on-secondary-fixed-variant: '#4f319c'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#131316'
  on-background: '#e4e1e6'
  surface-variant: '#353438'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 0.75rem
  gutter-tablet: 1rem
  margin: 1rem
  margin-tablet: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

The design system embodies a high-density, technical, yet frictionless management environment tailored for mobile-first ecommerce operators. It fuses the rapid operational clarity and utility of Latin America's leading marketplace workflows with a modern dark-mode aesthetic rooted in high-end developer tools and fintech interfaces.

### Personality & Emotional Response
- **Precision & Speed:** Instant visual orientation through high-contrast typography, strict layout grids, and minimal visual latency.
- **Electric Sophistication:** Confident, dark-ambient base surfaces illuminated by controlled, luminous violet accents that guide key operational decisions without visual fatigue.
- **Tactile Reliability:** Confirmed operations, crisp border delineations, and tactile state feedbacks create certainty when manipulating inventory, orders, and sales metrics under tight timeframes.

### Style Archetype: High-Tech Dark Minimalist
The aesthetic avoids purely flat, lifeless dark planes by balancing layered deep-zinc surfaces, luminous purple focal points, and razor-sharp structural boundaries. Interfaces are characterized by:
- Stacked dark surfaces rather than heavy blur planes.
- Micro-badge indicators and pill-shaped status tokens that communicate mission-critical status instantly.
- 1px hairline zinc borders that preserve spatial rhythm on OLED and high-density mobile screens without feeling heavy.

## Colors

The color palette is built for deep focus, optimal contrast, and immediate scanability in low-light environments.

### Core Foundation
- **Canvas Base (`#0F0F12`):** Ultra-deep charcoal base canvas ensuring zero distraction and optimal OLED power efficiency.
- **Surface Level 1 (`#18181B`):** Primary card, metric block, and sheet background.
- **Surface Level 2 (`#27272A`):** Interactive containers, table headers, elevated list items, and input wells.
- **Subtle Boundaries (`#27272A` / `#3F3F46`):** 1px boundaries defining structural components and layout tiers.

### Electric Accents
- **Electric Violet (`#7C3AED`):** Primary interaction point, key conversion actions, active tab markers, and primary batch triggers.
- **Luminous Violet (`#8B5CF6`):** Hover/press targets and active toggles.
- **Soft Lavender (`#A78BFA`):** Low-emphasis interactive highlights, chart strokes, and badge text accents.

### Functional Status Acento
- **Success (`#10B981`):** Completed dispatches, settled payments, positive profit margins.
- **Alert / Pending (`#F59E0B`):** Processing shipments, pending inventory checks, return requests.
- **Danger (`#EF4444`):** Stockouts, canceled orders, disputed transactions.

## Typography

The type system pairs **Plus Jakarta Sans** for structural headlines and metric displays with **Inter** for dense transactional tables, lists, and administrative inputs.

### Typographic Discipline
- **Numeric Optimization:** Use tabular figures (`font-variant-numeric: tabular-nums`) across all prices, stock counters, order IDs, and margin percentage indicators.
- **Hierarchy Stacking:** Main dashboard KPI counts employ `headline-lg` with tight tracking (`-0.02em`) to deliver impact in limited mobile card space.
- **Status Contrast:** Micro-labels (`label-sm`) leverage semi-uppercase tracking (`0.04em`) when placed inside pill badges to guarantee immediate legibility against tinted background fills.

## Layout & Spacing

Designed for mobile handheld operation with swift thumb reachability. The layout is built around a compact 4-column layout on mobile, transitioning to an 8-column layout on tablets.

### Layout Mechanics
- **Base Canvas Padding:** Screen edge margins are locked to `margin` (16px / 1rem) on mobile to maximize card surface area while avoiding accidental edge-swipe touches.
- **Grid Gutters:** Card lists, dual metric blocks, and action panels use a consistent `gutter` (12px / 0.75rem) gap, preserving high information density.
- **Vertical Flow:** Standard sections maintain a vertical separation of `space-xl` (24px / 1.5rem). Interior card elements stack tightly using `space-xs` (4px) to `space-sm` (8px).
- **Thumb-Zone Navigation:** Primary navigation anchors to a fixed bottom dock with elevated tap zones (minimum touch target 48x48px).

## Elevation & Depth

This design system avoids heavy skeuomorphic shadows or cloudy glass blurs, opting instead for **low-contrast outlines** coupled with **tonal layer stacking** and selective **ambient luminous glows**.

### Surface Hierarchy
1. **Level 0 (Canvas):** `#0F0F12` — Base background plane.
2. **Level 1 (Card / Tile):** `#18181B` — Background for orders, product items, and charts, bound by a crisp 1px border (`#27272A`).
3. **Level 2 (Active Element / Popover):** `#27272A` — Context sheets, active selection pills, bottom drawers, and modal sheets.

### Lighting & Borders
- **Hairline Precision:** All cards, floating modals, and input fields use an explicit `1px solid #27272A` stroke. On focused states or active selections, this border transitions to `1px solid #7C3AED`.
- **Violet Core Glow:** Floating primary CTAs or critical metrics utilize an ambient, low-spread glow: `0px 4px 20px rgba(124, 58, 237, 0.25)`.
- **Modals & Drawers:** High-elevation sheets implement an ultra-soft drop shadow (`0 20px 40px -15px rgba(0, 0, 0, 0.8)`) to visibly separate from the underlying canvas.

## Shapes

The interface balances soft industrial ergonomics with high-tech software precision.

- **Cards and Panels:** Standardize on `rounded-lg` (16px) to provide a smooth, comfortable frame for dense content.
- **Action Buttons & Inputs:** Styled with `rounded-xl` (12px to 16px) for an ergonomic, finger-friendly touch target.
- **Micro-Badges & Status Tags:** Always use full pill radii (`border-radius: 9999px`) to create an immediate shape-distinction against rectangular data blocks and cards.

## Components

### Buttons
- **Primary CTA:** Background `#7C3AED`, text white, `rounded-xl` (12px), height 48px, font `label-lg`. Subtle violet drop shadow (`0px 4px 14px rgba(124, 58, 237, 0.35)`).
- **Secondary:** Background `#18181B`, border `1px solid #27272A`, text `#E4E4E7`, height 48px, active state `#27272A`.
- **Ghost / Icon:** Transparent background, text `#A1A1AA`, hover/press `#27272A`. Touch hit-target padded to 44x44px minimum.

### Micro-Badges & Status Tags
- **Pill Badges:** Fully rounded (`rounded-full`), height 22px, padding `0 8px`, font `label-sm`.
  - *Paid / In Stock:* Background `rgba(16, 185, 129, 0.12)`, text `#10B981`, border `1px solid rgba(16, 185, 129, 0.2)`.
  - *Pending / Logistics:* Background `rgba(245, 158, 11, 0.12)`, text `#F59E0B`, border `1px solid rgba(245, 158, 11, 0.2)`.
  - *Critical / Out of Stock:* Background `rgba(239, 68, 68, 0.12)`, text `#EF4444`, border `1px solid rgba(239, 68, 68, 0.2)`.
  - *Metric / Tech Pill:* Background `rgba(124, 58, 237, 0.12)`, text `#A78BFA`, border `1px solid rgba(124, 58, 237, 0.25)`.

### Cards & Metrics
- **Order / Stock Card:** Surface `#18181B`, border `1px solid #27272A`, inner padding 14px, corner radius 16px. Top line features order ID and status pill; body features SKU preview thumbnail (40x40px, rounded-md) with quantity and customer details; bottom bar shows total in bold tabular figures alongside a quick action button.
- **KPI Summary Card:** Two-column grid layout. Surface `#18181B`, hairline zinc border, trend micro-indicator (e.g., `+12.4%` in `#10B981`) placed at the top-right corner.

### Form Inputs & Search Fields
- **Container:** Background `#0F0F12`, border `1px solid #27272A`, height 44px, corner radius 12px, text `#FAFAFA`, placeholder `#71717A`.
- **Focus State:** Border shifts directly to `#7C3AED` with an inner ring glow `0 0 0 1px #7C3AED`.

### Selection Controls (Checkbox & Radio)
- **Checkbox:** 20x20px square with 6px corner radius. Inactive: border `1px solid #3F3F46`, background `#18181B`. Active: background `#7C3AED`, border `#7C3AED`, featuring a sharp white check glyph.
- **Radio:** 20x20px circle. Active: concentric inner circle of `#7C3AED` surrounded by a 2px dark offset ring.

### Lists & Interactive Rows
- Flat row list style with separator lines of `1px solid #27272A`. Each row provides minimum 56px height, high-contrast title, secondary muted caption (`#A1A1AA`), and chevron icon or status tag at the far right.