# Architecture

## Stack

| Layer                    | Tool                                         | Purpose                                                                          |
| ------------------------ | -------------------------------------------- | -------------------------------------------------------------------------------- |
| **Framework**            | Next.js 16 (App Router)                      | Full stack framework                                                             |
| **Auth + DB + Storage**  | InsForge                                     | Authentication, application database, and PDF file storage                       |
| **Payment Processor**    | Stripe API                                   | Location-based payment checkout (UPI for India, Card for Global)                 |
| **AI Data Structurer**   | DeepSeek V4-Flash                            | JSON extraction from unstructured text/PDFs with cached system prompts           |
| **PDF Text Extraction**  | pdf-parse (Node.js)                          | Server-side text extraction from uploaded PDFs — runs in Next.js API routes      |
| **PDF Compilation**      | Handlebars + pdflatex (container)            | Deterministic JSON → LaTeX → PDF pipeline with watermark support                 |
| **Analytics**            | PostHog                                      | Event tracking and dashboard funnel charts                                       |
| **Styling**              | Tailwind CSS + shadcn/ui                     | Component modularity and functional layout design                                |
| **Language**             | TypeScript strict                            | Type safety across entire project architecture                                   |

---

## Deployment Model

Render Resume uses a **split deployment** strategy. InsForge handles backend services; the Next.js app runs on **AWS Lightsail** in Docker with TeX Live for `pdflatex`.

| Component | Where it runs | Why |
| --------- | ------------- | --- |
| Auth, DB, Storage, RLS | InsForge backend | Same pattern as Job Snow |
| Next.js frontend + API routes | **AWS Lightsail 2 GB + Docker** | Supports pdflatex; $12/mo (covered by AWS credits) |
| pdf-parse extraction | Next.js API route (`app/api/parser/`) | Pure Node.js — runs on the Lightsail instance |
| DeepSeek structuring | Next.js API route (`app/api/structurer/`) | External HTTP API — works anywhere |
| Stripe checkout/webhook | Next.js API routes | External HTTP API — works anywhere |
| pdflatex compilation | Docker container on Lightsail (TeX Live) | Cannot run on Lambda, App Runner, or InsForge edge functions |
| SSL + CDN | Cloudflare (free tier) | HTTPS and caching in front of Lightsail |

### Why "Local" Appears in Earlier Docs

Earlier drafts used "local parsing" and "local compilation" to mean **server-side, not browser-side** — not "runs only on your laptop." Clarifications:

| Term (old) | Actual meaning | Public deployment |
| ---------- | -------------- | ----------------- |
| Local Parsing Backend | `pdf-parse` in a Next.js API route | Runs on Lightsail instance alongside the app |
| Local Compilation | `child_process` invoking `pdflatex` on the server | Runs in Docker on Lightsail with TeX Live |

### Production Plan — AWS Lightsail (Path A)

**Chosen for month 1–2 startup scale (~100 users month 1, ~200–300 month 2).**

```
User → Cloudflare (free SSL/CDN) → AWS Lightsail 2GB → Docker (Next.js + TeX Live)
                                          ↓
                                    InsForge (auth, DB, storage)
                                    DeepSeek / Stripe / PostHog (external APIs)
```

**Instance spec:** Lightsail **Small bundle** — 2 vCPU, 2 GB RAM, 60 GB SSD, 3 TB transfer ($12/month)

**Alternative:** EC2 **t3.small** (2 GB RAM, 2 vCPU) at ~$15/mo — also free-tier eligible on new AWS accounts. Lightsail is preferred for simpler setup (fixed price, built-in firewall, static IP).

**AWS new-account credits:** $100 on signup + up to $100 more from starter activities = **$200 total**, valid for **6 months**. At $12/mo hosting, credits cover the full 6-month window with headroom. Choose the **Paid account plan** so the account stays open after credits expire.

**Why not AWS free-tier micro (t3.micro / 1 GB Lightsail)?** TeX Live + Node + concurrent compiles need ~2 GB RAM. Micro instances will OOM on pdflatex — not production-safe.

**Why not Lambda / App Runner / Fargate?** TeX Live Docker images are ~1.5–2 GB with no `pdflatex` in serverless runtimes. Cold starts and memory limits make serverless unsuitable.

**Expected load (month 1, ~100 users):**

| Metric | Estimate |
| ------ | -------- |
| Signups | ~100 |
| Active builders | ~70 |
| Preview compiles | ~350/month (~5 per active user) |
| Paid downloads | ~20/month |
| Peak concurrent compiles | 1–2 |

**Month 2 (~200–300 users):** Same Lightsail 2 GB instance is sufficient. Limit concurrent compiles to 2 via `MAX_COMPILE_CONCURRENCY` in `lib/utils.ts`. Upgrade to Lightsail 4 GB ($24/mo) only if compile queue backs up consistently.

**Estimated infra cost (excluding Stripe fees):**

| Item | Month 1 | Month 2 |
| ---- | ------- | ------- |
| AWS Lightsail 2 GB | $0 (credits) | $0 (credits) |
| Cloudflare | $0 | $0 |
| DeepSeek (~350–1000 structurings) | ~$0.35–1 | ~$1–3 |
| PostHog | Free tier | Free tier |
| InsForge | Your plan | Your plan |
| **Total infra** | **~$1–5** | **~$2–8** |

After AWS credits expire (~month 6): ~$12/mo Lightsail + DeepSeek usage.

### AWS Setup Checklist

1. Create AWS account — choose **Paid account plan** (credits apply, no charges until depleted)
2. Complete 5 starter activities to earn up to $100 additional credits (EC2 launch, Lambda, etc.)
3. Set a **billing budget alert** at $10 and $25 in AWS Budgets
4. Create Lightsail instance: **Small (2 GB)**, Linux/Ubuntu 22.04, region **`ap-south-1` (Mumbai)** for India users or **`us-east-1`** for global
5. Open Lightsail firewall: allow HTTP (80) and HTTPS (443)
6. SSH into instance → install Docker + Docker Compose
7. Deploy app container (see Dockerfile below)
8. Attach Lightsail static IP if not included
9. Point domain DNS to Cloudflare → proxy to Lightsail public IP
10. Set `NEXT_PUBLIC_APP_URL` to production domain (e.g. `https://renderresume.com`)
11. Add production callback URL to InsForge OAuth allowed redirects
12. Register Stripe webhook for production URL

### Dockerfile (Production)

```dockerfile
FROM node:20-bookworm

RUN apt-get update && apt-get install -y \
    texlive-latex-base \
    texlive-fonts-recommended \
    texlive-latex-extra \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start"]
```

### docker-compose.yml (Lightsail deployment)

```yaml
services:
  app:
    build: .
    restart: unless-stopped
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    mem_limit: 1800m
```

Run behind Cloudflare or an nginx reverse proxy on the instance for HTTPS termination.

### Compile Concurrency Guard

On a 2 GB instance, limit simultaneous `pdflatex` runs to prevent OOM:

```typescript
// lib/utils.ts
export const MAX_COMPILE_CONCURRENCY = 2;
```

`engine/compiler.ts` or `app/api/compile/route.ts` must queue or reject compiles when the limit is reached. Return a friendly "Preview generating, please wait" message — never crash the process.

### Fallback Paths (Not Primary)

**Path B — InsForge-only deploy (no LaTeX):** Deploy via InsForge `create-deployment` (Vercel-backed). Replace `pdflatex` with `@react-pdf/renderer`. Loses LaTeX fidelity — use only if AWS setup is blocked.

**Path C — Hybrid (advanced):** Next.js on InsForge + separate compile microservice on AWS. More moving parts — not needed at current scale.

**InsForge edge functions cannot run pdflatex.** They execute in Deno with no TeX Live binary.

---

## Folder Structure

```
/
├── proxy.ts                           → Route protection + session refresh
├── AGENTS.md
├── context/
│   ├── project-overview.md
│   ├── architecture.md
│   ├── ui-tokens.md
│   ├── ui-rules.md
│   ├── ui-registry.md
│   ├── code-standards.md
│   ├── library-docs.md
│   ├── build-plan.md
│   ├── progress-tracker.md
│   └── TEMPLATES.md                   → LaTeX template storage, registry, extension guide
├── app/
│   ├── layout.tsx                     → Root layout, PostHog provider
│   ├── page.tsx                       → Landing page & pricing overview
│   ├── (auth)/
│   │   ├── login/page.tsx             → Server login page + LoginCard
│   │   └── callback/route.ts          → OAuth code exchange + setAuthCookies
│   ├── dashboard/
│   │   └── page.tsx                   → User hub (requireUser)
│   ├── builder/
│   │   └── page.tsx                   → Split-pane editor + watermarked preview
│   ├── checkout/
│   │   └── success/page.tsx           → Post-payment fulfillment handler
│   └── api/
│       ├── auth/
│       │   ├── oauth/[provider]/route.ts
│       │   ├── refresh/route.ts
│       │   └── logout/route.ts
│       ├── parser/route.ts            → pdf-parse text extraction
│       ├── structurer/route.ts        → DeepSeek JSON structuring
│       ├── compile/route.ts           → Handlebars + pdflatex PDF generation
│       └── stripe/
│           ├── checkout/route.ts      → Localized Stripe checkout sessions
│           └── webhook/route.ts       → Credit fulfillment on payment
├── engine/
│   ├── extractor.ts                   → pdf-parse wrapper
│   ├── deepseek.ts                    → DeepSeek API with strict JSON schemas
│   ├── compiler.ts                    → Handlebars template injection + pdflatex
│   ├── types.ts                       → Resume schema and engine types
│   └── templates/
│       ├── registry.ts                → Template metadata (id, name, texPath, status)
│       ├── _shared/                     → Shared .sty snippets (watermark, etc.)
│       └── harvard/
│           └── resume.tex               → Harvard template (Handlebars-instrumented)
├── public/
│   └── templates/
│       └── thumbnails/
│           └── harvard.png              → TemplatePicker preview image
├── actions/
│   ├── resume.ts                      → Save, update, delete draft states
│   └── credits.ts                     → Credit validation and balance updates
├── components/
│   ├── ui/                            → shadcn/ui building blocks only
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── auth/
│   │   └── LoginCard.tsx              → OAuth form buttons
│   ├── homepage/
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   └── PricingTable.tsx
│   ├── dashboard/
│   │   ├── CreditBanner.tsx
│   │   ├── ResumeGrid.tsx
│   │   └── FunnelCharts.tsx
│   ├── workspace/
│   │   ├── DetailsForm.tsx
│   │   ├── PDFExtractor.tsx
│   │   ├── LivePreview.tsx
│   │   └── TemplatePicker.tsx
│   └── checkout/
│       ├── PricingTable.tsx
│       └── DownloadTrigger.tsx
├── lib/
│   ├── insforge-client.ts             → Browser InsForge client (`@insforge/sdk/ssr`)
│   ├── insforge-server.ts             → Server InsForge client
│   ├── auth.ts                        → getCurrentUser, requireUser
│   ├── stripe.ts                      → Stripe initialization
│   ├── posthog-client.ts              → PostHog browser client
│   ├── posthog-server.ts              → PostHog server client
│   └── utils.ts                       → Shared utilities and constants
└── types/
    └── index.ts                       → Global cross-application types
```

---

## System Boundaries

| Folder        | Owns                                                                                                              |
| ------------- | ----------------------------------------------------------------------------------------------------------------- |
| `app/`        | Pages and API route handlers only. No business logic — delegate to `engine/`.                                       |
| `engine/`     | Core business logic. DeepSeek, pdf-parse, Handlebars templating, pdflatex execution. No React imports.            |
| `actions/`    | Server Actions for UI-triggered mutations only. Draft save, credit deduction.                                     |
| `components/` | UI only. No DB calls, no Stripe calls, no engine imports.                                                        |
| `lib/`        | Third-party client initialization (InsForge, Stripe, PostHog) and shared utilities.                               |
| `types/`      | TypeScript types shared across the project.                                                                       |

---

## Data Flow

### UI Mutations (Server Actions)

```
User edits form field in builder
        ↓
Debounced Server Action in actions/resume.ts
        ↓
InsForge DB upsert to resumes table
        ↓
revalidatePath('/builder') or revalidatePath('/dashboard')
```

### Ingestion Flow (Parsing + Structuring)

```
User uploads PDF or pastes text in builder UI
        ↓
PostHog: ingestion_started
        ↓
POST app/api/parser/ — pdf-parse extracts plain text (Node.js, no AI)
        ↓
POST app/api/structurer/ — DeepSeek formats text into strict JSON schema
        ↓
PostHog: draft_structured
        ↓
JSON populates DetailsForm fields in frontend state
```

### Document Rendering Flow (Compilation)

```
User edits fields or changes template in builder
        ↓
POST app/api/compile/ with resume_data + selected_template + watermark=true
        ↓
engine/compiler.ts: Handlebars injects JSON into .tex template
        ↓
pdflatex runs in isolated tmp/[uuid]/ directory (container only)
        ↓
PostHog: preview_rendered
        ↓
PDF buffer returned to LivePreview canvas (watermarked, free)
```

### Payment & Fulfillment Flow

```
User clicks Download High-Res PDF
        ↓
actions/credits.ts checks current_credits
        ↓
If credits = 0: PostHog checkout_started → POST app/api/stripe/checkout/
        ↓
Stripe localized checkout (IN: UPI+Card ₹10, Global: Card $1.00)
        ↓
Stripe webhook → actions/credits.ts increments current_credits
        ↓
/checkout/success validates credit → compile with watermark=false
        ↓
Upload clean PDF to InsForge Storage resumes/{user_id}/{resume_id}.pdf
        ↓
Deduct 1 credit, PostHog resume_downloaded, trigger browser download
```

---

## InsForge Database Schema

### `profiles`

| Column          | Type        | Notes                                           |
| --------------- | ----------- | ----------------------------------------------- |
| id              | uuid        | Primary Key, references auth.users              |
| full_name       | text        | User profile name                               |
| email           | text        | Pre-mapped from auth                            |
| current_credits | integer     | Active balance for artifact downloads           |
| region_code     | text        | Country identifier (e.g. 'IN', 'US')            |
| created_at      | timestamptz | Account creation stamp                          |

### `resumes`

| Column             | Type        | Notes                                                                |
| ------------------ | ----------- | -------------------------------------------------------------------- |
| id                 | uuid        | Unique identifier                                                    |
| user_id            | uuid        | References profiles.id                                               |
| title              | text        | Dashboard display name                                               |
| resume_data        | jsonb       | Structured professional data (parsed by DeepSeek)                  |
| selected_template  | text        | Template ID mapping to Handlebars .tex files                         |
| target_storage_url | text        | Path to clean PDF in InsForge Storage                                |
| last_downloaded_at | timestamptz | Used for 24-hour grace period re-download logic                      |
| updated_at         | timestamptz | Last modification timestamp                                          |

---

## InsForge Storage

| Bucket    | Path Pattern                        | Access Rules                                      |
| --------- | ----------------------------------- | ------------------------------------------------- |
| `resumes` | `resumes/{user_id}/{resume_id}.pdf` | Authenticated owner only — RLS on storage.objects |

Access: authenticated users only, own files only.

---

## Authentication

- Provider: InsForge Auth via `@insforge/sdk/ssr` (Job Snow pattern)
- Methods: Google OAuth, GitHub OAuth via `/api/auth/oauth/[provider]`
- Session: server-owned cookies (`setAuthCookies` on `/callback`, refreshed via `proxy.ts` + `updateSession`)
- Protected routes: `/dashboard`, `/builder`, `/checkout/success`
- Public routes: `/`, `/login`, `/callback`
- Route protection: root `proxy.ts` with `updateSession` — redirects to `/login` when no `accessToken`
- Protected pages: `requireUser()` in Server Components
- Logout: `/api/auth/logout` clears cookies
- InsForge dashboard must have allowed redirect URLs: `http://localhost:3000/callback`, production `/callback`

---

## InsForge Client Pattern

Two separate InsForge instances — never mix them:

```typescript
// lib/insforge-client.ts — browser context (Storage, Realtime)
"use client";
import { createBrowserClient } from "@insforge/sdk/ssr";

export const insforge = createBrowserClient({
  refreshUrl: "/api/auth/refresh",
});

// lib/insforge-server.ts — server context
import { cookies } from "next/headers";
import { createServerClient } from "@insforge/sdk/ssr";

export async function createInsforgeServer() {
  return createServerClient({ cookies: await cookies() });
}

// lib/auth.ts — Server Component helpers
import { createInsforgeServer } from "@/lib/insforge-server";

export async function getCurrentUser() {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.auth.getCurrentUser();
  return error || !data.user ? null : data.user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
```

---

## Regional Pricing Logic (Stripe)

```typescript
// app/api/stripe/checkout/route.ts
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createInsforgeServer } from "@/lib/insforge-server";

export async function POST(req: Request) {
  const insforge = await createInsforgeServer();
  const { data } = await insforge.auth.getCurrentUser();
  const user = data?.user;

  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const countryCode = req.headers.get("cf-ipcountry") || "US";

  let priceId = process.env.STRIPE_PRICE_ID_GLOBAL!;
  if (countryCode === "IN") {
    priceId = process.env.STRIPE_PRICE_ID_IN!;
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: countryCode === "IN" ? ["upi", "card"] : ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "payment",
    metadata: { userId: user.id },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });

  return NextResponse.json({ success: true, url: session.url });
}
```

---

## PostHog Integration

Same wizard pattern as Job Snow:

- `instrumentation-client.ts` — browser init with `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`
- `lib/posthog-client.ts` — browser client, manual pageview tracking
- `lib/posthog-server.ts` — server client with `flushAt: 1`, `flushInterval: 0`
- `/ingest` reverse proxy in `next.config.ts`
- `posthog.identify(userId)` after login, `posthog.reset()` on logout

Events power dashboard funnel charts on `/dashboard`. See `code-standards.md` for the canonical event list.

---

## Invariants (System Guardrails)

- **No LLM LaTeX generation:** DeepSeek is strictly banned from emitting raw LaTeX. It outputs JSON only. LaTeX structure comes from Handlebars templates in `engine/templates/`. See `TEMPLATES.md`.
- **Template IDs are stable:** Never rename a template id after launch — existing drafts store `selected_template` by id. Add new templates instead.
- **Deterministic token budgets:** Every DeepSeek call uses a frozen system prompt block for context caching. Target: under $0.001 per structuring run.
- **Regional checkout cleanliness:** Use Stripe `mode: 'payment'` only — no subscriptions. Avoids Indian e-mandate validation issues.
- **Sanitized file pipeline:** Upload components never pass binary PDFs to DeepSeek. pdf-parse extracts text first.
- **Credit verification lock:** Unwatermarked PDF compilation requires server-side credit validation via `actions/credits.ts` before compile or storage write.
- **Compilation isolation:** Every pdflatex run uses `tmp/[uuid]/` and cleans up in a `finally` block. Never leave orphan directories.
- **Scope all queries:** Every InsForge query must filter by `user_id`. Never query without a user filter.
- **API routes delegate:** Route handlers validate input and call `engine/` functions. No business logic inline in routes.
- **PostHog event names are frozen:** Only the five events in `code-standards.md`. Add new events there first.
