# UI Rules

Concise rules for building the AI Resume Builder UI. These rules cover the most important patterns and constraints to keep the UI consistent, accessible, and performant without over-specifying every detail.

---

## Font

Always import Inter via `next/font/google` in the root layout.

```typescript
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

```

The `--font-sans` variable is declared in `@theme` in `globals.css`. Apply the font variable class to the `<html>` tag in root layout. Never use system fonts as the primary font.

---

## Assets & Design Source

Static assets and the Pencil design file live in **`public/`**:

| Asset | Path | Usage |
| --- | --- | --- |
| Brand logo | `public/render_resume_logo.png` | Reference as `/render_resume_logo.png` in Next.js (`<Image src="/render_resume_logo.png" />`) |
| UI mockups (Pencil) | `public/resume_builder_ui.pen` | Source of truth for layout, components, and visual specs |

**Exporting assets from Pencil:** If the pen file references images or you need new icons/graphics, export them from `resume_builder_ui.pen` in Pencil and save the output into `public/`. Do not commit assets only inside the `.pen` file — anything used in the app must exist under `public/`.

Exported page screenshots for reference live in `context/designs/` (PNG exports only; not served by the app).

---

## Layout Structure

* **Page max-width:** `1200px`, centered.
* **Main content padding:** `32px` on desktop, `16px` on mobile.
* **Header height:** `64px`, fixed to top, white background with a bottom border (`1px solid var(--border-light)`).
* **Builder Workspace Layout:** Full viewport height minus header (`calc(100vh - 64px)`). Two distinct columns split 40/60 or 50/50 depending on screen size. The right canvas panel should scroll independently of the left form panel.

---

## Navigation

Minimal, utility-focused top navbar.

* **Logged Out:** Logo + app name on the left, Login/Signup on the right.
* **Logged In:** Logo + app name, Dashboard link, Builder link, Credit Balance Badge on the right.
* **Active state:** `color: var(--primary)`, font-weight 500.
* **Inactive state:** `color: var(--text-secondary)`.

---

## Footer

Dark inverse footer on marketing pages. Full-width (breaks out of page padding).

* **Background:** `var(--color-inverse)` (`#0B0C0F`).
* **Main row:** `padding: 40px 48px`, `justify-content: space-between`.
* **Brand block:** 32px logo + **Render Resume** (18px, weight 700, white), description below in `var(--text-tertiary)`.
* **Link columns:** Product, Company, Legal — column headers in mono 12px uppercase, links in 14px white.
* **Bottom bar:** Top border, copyright left, product meta right — 12px tertiary text.

---

## Workspace Split-Pane Architecture

The `/builder` route utilizes a strict dual-pane design:

**Left Panel (Input/Editing):**

* Standard scrollable container.
* Holds the PDF Dropzone, Template Selection Grid, and the structured Details Form accordions.
* Background: White.

**Right Panel (Preview Canvas):**

* Fixed viewport height.
* Contains the live PDF rendering embed.
* Background: `#F3F4F6` (light gray) to make the white PDF document "pop" visually.

---

## Cards & Containers

Every dashboard section or distinct form group lives in a card.

```css
background: #FFFFFF;
border: 1px solid var(--border-light);
border-radius: 12px;
padding: 24px;
box-shadow: 0 1px 3px rgba(0,0,0,0.05);

```

Never use colored card backgrounds — always white. Color goes inside cards via badges, bars, and text, never on the card surface itself.

---

## Typography Hierarchy

Three levels used consistently throughout:

**Section Headings** — Card titles, page section titles.

```css
font-size: 18px;
font-weight: 600;
color: var(--text-primary);
line-height: 28px;

```

**Body / Primary Content** — Form labels, standard text.

```css
font-size: 14px;
font-weight: 500;
color: var(--text-primary);
line-height: 20px;

```

**Secondary / Muted Text** — Helper text, placeholders, timestamps.

```css
font-size: 12px;
font-weight: 400;
color: var(--text-secondary);
line-height: 16px;

```

---

## Form Inputs & Dropzones

**Standard Inputs:**

```css
background: #FFFFFF;
border: 1px solid var(--border-light);
border-radius: 8px;
padding: 10px 14px;
font-size: 14px;
color: var(--text-primary);
/* Focus state: ring-2 ring-primary/20 border-primary */

```

**File Dropzone:**

* Dashed border (`2px dashed var(--border-light)`).
* Hover state: Border turns solid primary color (`var(--primary)`), background shifts to a very light primary tint.
* Central upload icon with descriptive helper text below it.

---

## Buttons

**Primary CTA (Checkout / Download):**

```css
background: var(--primary); /* DeepSeek/Platform Brand Color */
color: #FFFFFF;
border-radius: 8px;
padding: 10px 20px;
font-size: 14px;
font-weight: 600;
box-shadow: 0 4px 6px -1px rgba(var(--primary-rgb), 0.2);

```

**Secondary Action (Save Draft / Add Field):**

```css
background: #FFFFFF;
border: 1px solid var(--border-light);
color: var(--text-primary);
border-radius: 8px;
padding: 8px 16px;

```

---

## Empty States & Loaders

**Empty States:**

* Short descriptive text in `var(--text-secondary)`.
* Faded, stroke-based Lucide icon centered above text.
* Must include a logical CTA (e.g., "Upload your first resume").

**Loading States (Crucial for AI parsing):**

* When DeepSeek is parsing an uploaded PDF, the left panel must display a clear, friendly loading skeleton or spinner with text: *"Extracting and structuring your history..."*
* When the local LaTeX compiler is running, the right canvas must show a subtle pulsing overlay or progress bar, indicating a new preview is being generated. Do not fully unmount the old PDF while the new one compiles.

---

## Tailwind v4 Architecture

This project uses Tailwind v4. Tokens are defined with `@theme` in `globals.css` — no `tailwind.config.ts` needed.

**Core Variable Mapping (`globals.css`):**

```css
@theme {
  --color-primary: #2356F6;
  --color-primary-hover: #1A45D6;
  --color-text-primary: #15161A;
  --color-text-secondary: #6B7280;
  --color-text-tertiary: #9CA3AF;
  --color-text-inverse: #FFFFFF;
  --color-border-light: #E5E7EB;
  --color-inverse: #0B0C0F;
  --color-page: #FAFAFA;
  --color-sunken: #F1F2F4;
}

```

Token values are defined in full in `ui-tokens.md`. Pencil mockups (`public/resume_builder_ui.pen`) use the same hex values via design variables.

---

## Invariants / Do Nots

* **No Raw Colors:** Never use Tailwind's built-in color classes (`bg-blue-500`, `text-gray-600`) — use the mapped project tokens (`bg-primary`, `text-secondary`).
* **No Config File:** Never define colors in `tailwind.config.ts` — use `@theme` in `globals.css`.
* **No Complex Radii:** Never stack more than 2 levels of border radius inside each other.
* **No Hidden Charges:** The "Download High-Res PDF" button must clearly state the price (e.g., "Download PDF - $1.00"). Never hide the cost behind a generic "Download" label.
* **No Layout Jumps:** Ensure the PDF preview canvas maintains a reserved aspect ratio or minimum height so the page doesn't violently jump when compiling from an empty state to a rendered document.