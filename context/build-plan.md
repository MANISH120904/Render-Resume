# Build Plan

## Core Principle

Full page UI built with mock data first — verified visually before any logic is written. Then functionality is built and wired to the UI step by step. Every feature must be visible and testable before moving to the next. No invisible backend phases.

---

## Phase 1 — Foundation

### 01 Homepage

Build the complete homepage UI.

**UI:**

- Navbar — logo (Render Resume), Dashboard, Builder links, Sign In button
- Hero section — headline, subheadline, Get Started CTA, before/after resume visual
- Features section — three value props (DeepSeek parsing, LaTeX templates, transparent pricing)
- Pricing table — Free Preview (watermarked) vs. Pay-per-download ($1 / ₹10)
- Bottom CTA section
- Footer — dark inverse layout per ui-rules.md

**Logic:**

- Get Started → `/login` if not authenticated, `/dashboard` if authenticated

---

### 02 Auth

InsForge authentication — Google and GitHub OAuth.

**UI:**

- Login page — Google OAuth button, GitHub OAuth button

**Logic:**

- Google/GitHub OAuth via server routes (`/api/auth/oauth/[provider]`) with `skipBrowserRedirect`
- OAuth callback at `/callback` — `exchangeOAuthCode()` + `setAuthCookies()`
- Session refresh via `/api/auth/refresh` (`createRefreshAuthRouter`)
- Logout via `/api/auth/logout` (`clearAuthCookies`)
- Route protection via root `proxy.ts` + `updateSession` for `/dashboard`, `/builder`, `/checkout/success`
- Protected pages use `requireUser()` in Server Components
- After login → redirect to `/dashboard`
- InsForge dashboard: add allowed redirect URLs (`http://localhost:3000/callback` + production `/callback`)

---

### 03 PostHog Initialization

Set up PostHog before any events fire. Must be done before builder features.

**Logic:**

- Create `lib/posthog-client.ts` — browser client with `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST`
- Create `lib/posthog-server.ts` — server client with `flushAt: 1` and `flushInterval: 0`
- Create `instrumentation-client.ts` — browser init per PostHog Next.js wizard
- Add `/ingest` reverse proxy in `next.config.ts`
- Initialize PostHog in root app layout
- `posthog.identify(userId)` after successful login
- `posthog.reset()` on logout

---

### 04 Database Schema

All InsForge tables and storage bucket created before any data is written.

**Logic:**

- Create `profiles` table with all columns from architecture.md
- Create `resumes` table with all columns including `last_downloaded_at`
- Create `resumes` storage bucket with authenticated access only
- Row level security policies on both tables — always filter by `user_id`
- RLS on `storage.objects` for the resumes bucket

---

### 05 Stripe Initialization

Set up payment infrastructure before tying it to downloads.

**Logic:**

- Initialize Stripe in `lib/stripe.ts`
- Configure `STRIPE_PRICE_ID_IN` (₹10) and `STRIPE_PRICE_ID_GLOBAL` ($1.00) in `.env.local`
- Build `app/api/stripe/webhook/route.ts` for `checkout.session.completed`
- Webhook increments `current_credits` in InsForge `profiles` table
- Stripe CLI forwarding for local webhook testing

---

## Phase 2 — Resume Workspace & Ingestion

### 06 Builder Page — Full UI

Build the main editor workspace UI with mock data. No logic yet.

**UI:**

- Split view layout — form left (40%), preview canvas right (60%)
- Left panel:
  - PDF dropzone ("Upload existing PDF or paste raw text")
  - Details Form — accordions for Personal Info, Experience, Education, Skills
  - Template Picker — visual grid of 3–4 LaTeX template thumbnails
- Right panel:
  - Mock watermarked PDF canvas on `bg-canvas` background
  - "Download High-Res PDF — $1.00" CTA at top

---

### 07 PDF Text Extraction

Handle messy uploads server-side before hitting the AI.

**Logic:**

- POST `/api/parser/` receives file buffer from dropzone
- `engine/extractor.ts` wraps `pdf-parse` to extract raw text
- If text is empty or too short — return error: "Could not extract text from this PDF. Please paste text manually."
- Pass plain text back to frontend state

**PostHog event:** `ingestion_started` — `{ userId, method: 'upload' | 'paste' }`

---

### 08 AI Data Structurer (DeepSeek V4-Flash)

Convert messy text into strict JSON schema.

**Logic:**

- POST `/api/structurer/`
- Receives raw string from parser or direct paste input
- `engine/deepseek.ts` sends to DeepSeek with frozen system prompt and `response_format: { type: 'json_object' }`
- Returns structured JSON: `personalInfo`, `experience[]`, `education[]`, `skills[]`
- UI populates DetailsForm automatically

**PostHog event:** `draft_structured` — `{ userId, resumeId }`

---

### 09 Draft State Management

Wire the form to auto-save user progress.

**Logic:**

- Server Action in `actions/resume.ts`
- Triggered on 3-second debounce when form fields change
- Upserts JSON state to `resumes` table in InsForge
- Updates `selected_template` when user picks a different template
- `revalidatePath('/builder')` after save

---

## Phase 3 — Compilation & Preview

### 10 LaTeX Compiler + Harvard Template

Merge JSON data with static templates and render PDF. Launch with one template: **Harvard** (from Overleaf, converted to Handlebars).

**Logic:**

- POST `/api/compile/`
- Receives `resume_data`, `selected_template`, and `watermark` boolean
- `engine/compiler.ts`: loads `.tex` from `engine/templates/` via `registry.ts`
- Handlebars injects JSON into template; watermark flag for preview vs download
- Executes `pdflatex` in isolated `tmp/[uuid]/` directory
- Returns compiled PDF buffer
- Cleans up tmp directory in `finally` block

**Template files (see TEMPLATES.md):**

- Create `engine/templates/registry.ts` — registry with Harvard as `DEFAULT_TEMPLATE_ID`
- Create `engine/templates/harvard/resume.tex` — Overleaf Harvard source with Handlebars placeholders
- Create `engine/templates/_shared/` — watermark snippet for preview mode
- Create `public/templates/thumbnails/harvard.png` — TemplatePicker thumbnail
- Templates live in **project directory**, baked into Docker image on deploy — not a separate container volume

**Requires:** TeX Live in Docker on AWS Lightsail (see architecture.md). Limit concurrent compiles with `MAX_COMPILE_CONCURRENCY = 2`.

**PostHog event:** `preview_rendered` — `{ userId, templateId }`

---

### 11 Live Preview Rendering

Render compiled output on screen in real time.

**Logic:**

- Builder sends compile request after each draft auto-save
- Receives watermarked PDF buffer from compile API
- Displays in right panel via `<embed>` or `react-pdf`
- Show loading overlay during compilation — do not unmount previous preview
- Free and unlimited for the user

---

## Phase 4 — Checkout & Fulfillment

### 12 Adaptive Checkout

Micro-transaction trigger for clean download.

**Logic:**

- User clicks "Download High-Res PDF"
- `actions/credits.ts` checks `current_credits`
- If credits = 0: POST `/api/stripe/checkout/`
- Read `cf-ipcountry` header for region routing
- Return localized Stripe Checkout Session URL
- Redirect user to Stripe hosted page

**PostHog event:** `checkout_started` — `{ userId, regionCode }`

---

### 13 High-Res Download Fulfillment

Unlock clean file once payment is confirmed.

**Logic:**

- User returns to `/checkout/success`
- Validate `current_credits > 0` via `actions/credits.ts`
- POST `/api/compile/` with `watermark=false`
- Upload clean PDF buffer to InsForge Storage at `resumes/{user_id}/{resume_id}.pdf`
- Deduct 1 credit from profile
- Update `last_downloaded_at` on resume row
- Trigger native browser download

**PostHog event:** `resume_downloaded` — `{ userId, resumeId }`

**Grace period:** If `last_downloaded_at` is within 24 hours, skip credit deduction

---

## Phase 5 — Dashboard

### 14 Dashboard Page — Full UI

Build the user hub with mock data.

**UI:**

- Credit balance banner — available downloads, "Buy Credits" CTA
- "Create New Resume" prominent card
- Resume grid — cards showing title, template, last edited, Edit/Download buttons
- Funnel analytics section (mock charts):
  - Ingestions over time — line chart
  - Previews rendered — bar chart
  - Downloads completed — bar chart

---

### 15 Dashboard Data Wiring

Wire dashboard to real InsForge DB data.

**Logic:**

- Fetch `current_credits` from `profiles` for credit banner
- Query `resumes` table for authenticated user, ordered by `updated_at` desc
- Edit button → `/builder?resumeId={id}` loads that draft
- Download button → checks grace period, deducts credit if needed, fetches from Storage

---

### 16 Analytics Charts — PostHog Data

Wire three dashboard charts to real PostHog event data.

**Logic:**

- Ingestions Over Time — query PostHog for `ingestion_started` events, last 30 days, group by day
- Previews Rendered — query PostHog for `preview_rendered` events, last 7 days, group by day
- Downloads Completed — query PostHog for `resume_downloaded` events, last 30 days, group by day
- All charts rendered with recharts
- Empty state for each chart when no data exists

---

## Phase 6 — Deployment (AWS)

### 17 AWS Production Deployment

Deploy the full app publicly on AWS Lightsail with LaTeX support. Target scale: ~100 users month 1, ~200–300 month 2 on a single 2 GB instance ($12/mo, covered by AWS credits).

**Infrastructure:**

- Create AWS account — **Paid account plan** ($100 credits on signup + up to $100 more from activities)
- Set billing budget alerts at $10 and $25 in AWS Budgets
- Create Lightsail instance: **Small (2 GB)**, Ubuntu 22.04
- Region: `ap-south-1` (Mumbai) for India-heavy traffic, or `us-east-1` for global
- Open Lightsail firewall: ports 80/443
- SSH in → install Docker + Docker Compose
- Cloudflare (free): DNS + SSL proxy in front of Lightsail static IP

**App deployment:**

- Create `Dockerfile` with Node 20 + TeX Live (see architecture.md)
- Create `docker-compose.yml` with `mem_limit: 1800m` and `restart: unless-stopped`
- Create `.env.production` with all secrets (never commit)
- Build and run: `docker compose up -d --build`
- Optional: nginx reverse proxy on instance for HTTPS if not using Cloudflare full proxy

**Configuration:**

- Set `NEXT_PUBLIC_APP_URL` to production domain (e.g. `https://renderresume.com`)
- InsForge dashboard: add production OAuth redirect URL (`https://yourdomain.com/callback`)
- Stripe dashboard: register webhook endpoint (`https://yourdomain.com/api/stripe/webhook`)
- PostHog: confirm events appear after deploy

**Compile safety:**

- Implement `MAX_COMPILE_CONCURRENCY = 2` in `lib/utils.ts`
- Queue or reject compiles in `app/api/compile/route.ts` when limit reached

**Smoke test:**

- Sign up → upload PDF → preview renders → checkout → download clean PDF
- Verify Stripe webhook credits account
- Verify PostHog funnel events fire

**Fallback (not primary):** InsForge `create-deployment` + `@react-pdf/renderer` instead of pdflatex — see architecture.md Path B.

---

## Feature Count

| Phase                          | Features |
| ------------------------------ | -------- |
| Phase 1 — Foundation           | 5        |
| Phase 2 — Workspace & Ingestion| 4        |
| Phase 3 — Compilation & Preview| 2        |
| Phase 4 — Checkout & Fulfillment | 2     |
| Phase 5 — Dashboard            | 3        |
| Phase 6 — Deployment           | 1        |
| **Total**                      | **17**   |
