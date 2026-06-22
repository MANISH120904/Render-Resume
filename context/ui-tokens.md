# UI Tokens

Design tokens for the AI Resume Builder. All colors, typography, spacing, and component values are extracted from the core design rules. Use these exact values throughout the codebase — never hardcode hex colors or use raw Tailwind default color classes in components.

---

## How to Use

This project uses **Tailwind CSS v4**. All design tokens are defined using the `@theme` directive in `app/globals.css`. No `tailwind.config.ts` needed for colors or tokens.

Tailwind v4 automatically generates utility classes from `@theme` variables:

- `--color-primary` → `bg-primary`, `text-primary`, `border-primary`
- `--color-surface` → `bg-surface`, `text-surface`, `border-surface`

```tsx
// Correct — uses generated utility classes
className="bg-surface text-text-primary border-border-light"

// Also correct — references CSS variable directly
style={{ color: 'var(--color-text-primary)' }}

// Never — hardcoded hex values
className="bg-[#F3F4F6] text-[#111827]"

// Never — raw Tailwind default color classes
className="bg-blue-500 text-gray-600"

```

---

## Assets

Brand logo and the Pencil design file are in **`public/`**:

- **Logo:** `public/render_resume_logo.png` → `/render_resume_logo.png` in the app
- **Pen file:** `public/resume_builder_ui.pen` — open in Pencil for mockups; export any needed images from there into `public/`

See `ui-rules.md` → **Assets & Design Source** for the full workflow.

---

## globals.css — Complete Token Definition

```css
@import "tailwindcss";

@theme {
  /* Font */
  --font-sans: "Inter", sans-serif;

  /* Page and surface backgrounds */
  --color-background: #ffffff;
  --color-surface: #ffffff;
  --color-surface-secondary: #f9fafb;
  --color-canvas: #f3f4f6; /* Right-hand preview pane */
  --color-page: #fafafa; /* Marketing / landing page canvas */
  --color-sunken: #f1f2f4; /* Inset panels, code blocks */
  --color-inverse: #0b0c0f; /* Footer, dark sections */

  /* Borders */
  --color-border-light: #e5e7eb;
  --color-border-muted: #d1d5db;

  /* Text */
  --color-text-primary: #15161a;
  --color-text-secondary: #6b7280;
  --color-text-muted: #9ca3af;
  --color-text-tertiary: #9ca3af; /* Footer labels, column headers on dark bg */
  --color-text-inverse: #ffffff;

  /* Primary Accent — Brand Blue */
  --color-primary: #2356f6;
  --color-primary-hover: #1a45d6;
  --color-primary-light: #dbeafe;
  --color-primary-muted: #eff6ff;

  /* Success — Green (Fulfillment & Compilation) */
  --color-success: #10b981;
  --color-success-dark: #059669;
  --color-success-light: #d1fae5;

  /* Warning — Orange (Low Credits / Draft State) */
  --color-warning: #f59e0b;
  --color-warning-light: #fef3c7;

  /* Error — Red (Compilation Failed / Upload Failed) */
  --color-error: #ef4444;
  --color-error-light: #fee2e2;

  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
}

```

---

## Color Usage Guide

### Page Layout

| Element | Token |
| --- | --- |
| Default page background | `bg-background` |
| Marketing / landing canvas | `bg-page` |
| Form cards / left panel | `bg-surface` |
| PDF Preview area (right panel) | `bg-canvas` |
| Inset panels / code blocks | `bg-sunken` |
| Footer / dark sections | `bg-inverse` |
| Form inputs & dropzones | `bg-surface` |
| Standard borders | `border-border-light` |

### Typography

| Element | Token |
| --- | --- |
| Headings, standard body text | `text-text-primary` (#15161A) |
| Labels, helper text | `text-text-secondary` (#6B7280) |
| Placeholders, disabled states | `text-text-muted` (#9CA3AF) |
| Footer column headers on dark bg | `text-text-tertiary` (#9CA3AF) |
| Button text (primary) | `text-text-inverse` (#FFFFFF) |

### Status Badges & Indicators

| Status | Background | Text |
| --- | --- | --- |
| Compilation Success | `bg-success-light` | `text-success-dark` |
| Processing / AI Structuring | `bg-primary-light` | `text-primary` |
| Draft Auto-saving | `bg-warning-light` | `text-warning` |
| Checkout / Payment Link | `bg-surface-secondary` | `text-text-primary` |

---

## Typography

| Element | Size | Weight | Line height | Color token |
| --- | --- | --- | --- | --- |
| Logo text | 18px | 700 | 1.2 | `text-text-primary` (light on `bg-inverse`) |
| Metric number (Dashboard) | 32px | 600 | 40px | `text-text-primary` |
| Section heading / Form title | 18px | 600 | 28px | `text-text-primary` |
| Nav item (active) | 14px | 500 | 20px | `text-primary` |
| Nav item (inactive) | 14px | 500 | 20px | `text-text-secondary` |
| Body / Form Input | 14px | 500 | 20px | `text-text-primary` |
| Timestamp / Muted helper | 12px | 400 | 16px | `text-text-secondary` |

**Font family:** **Inter** — import from Google Fonts via `next/font/google`.

---

## Spacing

| Token | Value | Usage |
| --- | --- | --- |
| `gap-1` | 4px | Tight inline gaps (e.g., icon and text) |
| `gap-2` | 8px | Tag gaps, tight form rows |
| `gap-4` | 16px | Standard form field vertical spacing |
| `gap-6` | 24px | Spacing between major layout blocks |
| `gap-8` | 32px | Outer page padding (desktop) |
| `p-4` | 16px | Standard card padding |
| `p-6` | 24px | Large section/container padding |
| `px-5 py-2.5` | 20px / 10px | Primary Checkout / Download button padding |

---

## Component Tokens

### Cards & Form Containers

```text
background: bg-surface
border: 1px solid var(--border-light)
border-radius: 12px (rounded-lg in Tailwind)
padding: 24px (p-6)
box-shadow: 0 1px 3px rgba(0,0,0,0.05)

```

### File Dropzone

```text
background: hover:bg-primary-muted
border: 2px dashed var(--border-light)
hover border: border-primary
border-radius: 8px (rounded-md)
padding: 32px (p-8)
text: text-text-secondary

```

### Buttons

**Primary (Checkout / Download / Compile):**

```text
background: bg-primary
hover background: hover:bg-primary-hover
text: text-text-inverse
border-radius: rounded-md
padding: px-5 py-2.5
font-weight: font-semibold
shadow: shadow-md

```

**Secondary (Save Draft / Add Item):**

```text
background: bg-surface
border: 1px solid var(--border-light)
text: text-text-primary
hover background: hover:bg-surface-secondary
border-radius: rounded-md
padding: px-4 py-2

```

### Input Fields

```text
background: bg-surface
border: 1px solid var(--border-light)
border-radius: rounded-md
padding: px-3 py-2.5
text: text-text-primary
placeholder: text-text-muted
focus: ring-2 ring-primary/20 border-primary outline-none

```

### Credit Balance Badge

```text
background: bg-primary-light
text color: text-primary-hover
border-radius: rounded-full
padding: px-3 py-1
font-size: text-sm
font-weight: font-medium

```

### Footer

```text
background: bg-inverse (#0B0C0F)
main padding: 40px vertical, 48px horizontal
layout: space-between row — brand left, link columns right
brand: 32px logo + 18px/700 app name (text-text-inverse)
description: 14px/400 text-text-tertiary, max-width ~340px
column headers: 12px mono, letter-spacing 0.08em, text-text-tertiary
column links: 14px/400 text-text-inverse, 10px vertical gap
column gap: 56px
bottom bar: top border border-border-strong (#15161A), 20px vertical padding
copyright + meta: 12px text-text-tertiary
```

> **Design note:** Pencil mockups use Geist / Geist Mono for display. Implementation uses **Inter** per ui-rules.md — keep token values identical; only the font family differs in design files.

---

## Invariants

* **Never use hex values directly in components** — always use CSS variables via generated Tailwind tokens (`bg-primary`, `text-text-muted`).
* **Font is Inter** — always import via `next/font/google`, never rely on a system fallback font.
* **Never use raw Tailwind color classes** like `bg-blue-500` or `text-gray-600` — the UI must strictly adhere to the project's mapped tokens.
* **All borders default to `--border-light**` (`#E5E7EB`) — never use `border-gray-*`.
* **Canvas Distinction:** The right-hand PDF canvas panel must always use `bg-canvas` (`#F3F4F6`) to ensure the white PDF document renders with a clear visual boundary.