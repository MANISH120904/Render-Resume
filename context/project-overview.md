# Project Overview

## About the Project

Render Resume is a full-stack AI resume builder for developers and technical professionals. Users paste raw career history or upload an existing PDF. The platform extracts text with `pdf-parse`, structures it into a strict JSON schema via DeepSeek V4-Flash, and compiles professional ATS-optimized LaTeX resumes through Handlebars templates and `pdflatex`.

The builder workspace is a split-pane editor: structured form inputs on the left, a live watermarked PDF preview on the right. Clean, unwatermarked downloads cost one credit via localized Stripe checkout — $1.00 globally, ₹10 in India with UPI support.

The dashboard tracks credit balances, saved drafts, and PostHog-powered funnel analytics.

---

## The Problem It Solves

Modern resume tools are either basic text fields, drag-and-drop builders that fail ATS parsers, or expensive AI tools charging per run. LaTeX produces the best ATS output but requires local TeX installations and syntax knowledge most developers avoid.

Render Resume automates the full pipeline: extract → structure → compile. Costs stay low by keeping AI usage to JSON parsing only ($0.001/run) and using deterministic LaTeX templating for everything else.

---

## Pages

```
/                     → Homepage (hero, features, pricing)
/login                → Auth page (Google + GitHub OAuth)
/callback             → OAuth callback (token exchange + cookie setup)
/dashboard            → Credit balance, draft list, funnel analytics (protected)
/builder              → Split-pane editor + live watermarked preview (protected)
/checkout/success     → Post-payment fulfillment and download (protected)
```

---

## Navigation

Top navbar. Clean and minimal. Items change by auth state:

```
Logged Out:   [Logo Render Resume]                              [Sign In]
Logged In:    [Logo]    Dashboard    Builder    [Credits: X]    [Sign Out]
```

Full width layout on all pages. No sidebar.

---

## Core User Flow

### Homepage

- Hero section with before/after resume visual
- Features section — DeepSeek parsing, LaTeX templates, transparent pricing
- Pricing table — Free watermarked preview vs. pay-per-download
- Logged in users → redirect to `/dashboard`
- Logged out users → CTAs point to `/login`

### Authentication & Onboarding

- User signs up via InsForge auth (Google or GitHub OAuth)
- On login → redirect to `/dashboard`
- First login creates a `profiles` row with `current_credits: 0`
- Region code resolved from `cf-ipcountry` header if not set

### Ingestion & AI Structuring

- User opens `/builder` and uploads a PDF or pastes raw text
- `POST /api/parser/` runs `pdf-parse` to extract plain text (no AI cost)
- `POST /api/structurer/` sends text to DeepSeek V4-Flash for strict JSON output
- Form fields auto-populate from the structured JSON
- User reviews and edits before saving

### Live Workspace & Compilation

- Split-pane layout: form on left, PDF canvas on right
- Form edits trigger debounced auto-save to `resumes` table via Server Action
- Each save triggers `POST /api/compile/` with `watermark=true`
- Watermarked preview renders in the right panel — free, unlimited refreshes

### Adaptive Checkout & Download

- User clicks "Download High-Res PDF — $1.00" (or ₹10)
- If `current_credits = 0`: Stripe checkout opens with localized pricing
  - **India (`IN`):** UPI + card at ₹10
  - **Global:** Card at $1.00
- Stripe webhook credits the account on payment success
- `/checkout/success` compiles without watermark, uploads to InsForge Storage, deducts 1 credit, triggers download
- **Grace window:** Re-downloading the same resume within 24 hours of last download is free

### Dashboard

- Credit balance banner with "Buy Credits" CTA
- "Create New Resume" card
- Resume grid — title, template, last edited, Edit/Download actions
- Funnel analytics (PostHog powered):
  - Ingestions over time — line chart
  - Previews rendered — bar chart
  - Downloads completed — bar chart

---

## Data Architecture

### Profile Data (`profiles`)

- Account identity (`id`, `full_name`, `email`)
- Payment state (`current_credits`, `region_code`)
- Only modified by auth signup, Stripe webhook, and credit deduction

### Resume Drafts (`resumes`)

- One row per saved resume document
- `resume_data` jsonb holds the full structured JSON from DeepSeek + user edits
- `selected_template` tracks active LaTeX template
- `target_storage_url` points to the last clean PDF in InsForge Storage
- `last_downloaded_at` enables the 24-hour grace period

---

## Features In Scope

- Homepage with hero, features, pricing table, footer
- Top navbar — Dashboard, Builder, credit badge
- InsForge authentication (Google + GitHub OAuth)
- Redirect to dashboard after login
- Split-pane builder workspace with form sections and template picker
- PDF upload with `pdf-parse` text extraction
- Raw text paste as alternative ingestion method
- DeepSeek V4-Flash JSON structuring from extracted text
- Debounced draft auto-save to InsForge
- Handlebars + pdflatex compilation with watermark for free preview
- Live watermarked PDF preview in builder canvas
- Geo-targeted Stripe checkout (UPI for India, card globally)
- Credit-based download fulfillment with InsForge Storage
- 24-hour grace period for re-downloads after edits
- Dashboard with credit banner, resume grid, funnel charts
- PostHog event tracking throughout
- PostHog analytics charts on dashboard

---

## Features Out of Scope

- Job board integration or application autofill
- Resume tailoring per job description
- Drag-and-drop visual resume builder
- Cover letter generation
- AI-written professional summaries or grammar checking
- Multi-user or team accounts
- Subscription billing — pay-per-download only
- Client-side PDF compilation
- Python/FastAPI parsing microservice — pdf-parse runs in Node.js API routes
- Mobile app

---

## PostHog Events

```typescript
ingestion_started;  // { userId, method: 'upload' | 'paste' }
draft_structured;   // { userId, resumeId }
preview_rendered;   // { userId, templateId }
checkout_started;   // { userId, regionCode }
resume_downloaded;  // { userId, resumeId }
```

---

## Target User

A developer or technical professional who:

- Wants ATS-optimized LaTeX resume output without managing TeX locally
- Has an existing resume PDF or raw career history to start from
- Prefers pay-per-download over recurring subscriptions
- Is comfortable with a modern web application

---

## Success Criteria

- User can sign up, ingest a resume, and see a watermarked preview in under 60 seconds
- DeepSeek JSON parsing maps raw text into form fields without breaking the schema
- pdflatex compiles cleanly in isolated tmp directories with no resource leaks
- Stripe routes to correct regional pricing and payment methods automatically
- PostHog events fire correctly for all five funnel actions
- Dashboard analytics charts show meaningful data after several builder sessions
- App is publicly accessible on AWS Lightsail (2 GB + Docker + TeX Live)
- UI is visually consistent across all pages
