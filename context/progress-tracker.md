# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 1 — Foundation  
**Last completed:** 02 Auth (2026-06-22)  
**Next:** 03 PostHog Initialization — instrumentation-client.ts, identify on login, reset on logout

**Backend:** InsForge provisioned (Render Resume — `7n9p3vut.ap-southeast.insforge.app`). Google + GitHub OAuth enabled. Tables and storage not created yet.

**Deployment:** AWS Lightsail 2 GB + Docker + Cloudflare. $12/mo (covered by $100–200 AWS credits for ~6 months). InsForge handles auth/DB/storage only. See architecture.md Deployment Model.

---

## Progress

### Phase 1 — Foundation

- [x] **01 Homepage** — UI complete (Navbar, Hero, HeroVisual, Features, PricingTable, Footer). Auth-aware CTAs link to `/login` or `/dashboard` via session.
- [x] **02 Auth** — `@insforge/sdk/ssr` OAuth (Google/GitHub), server-owned cookies, `proxy.ts` route protection, `/callback`, auth API routes.
- [ ] **03 PostHog Initialization** — `instrumentation-client.ts`, `lib/posthog-client.ts`, `lib/posthog-server.ts`, `/ingest` proxy in `next.config.ts`. Identify on login, reset on logout.
- [ ] **04 Database Schema** — Tables: `profiles`, `resumes` (incl. `last_downloaded_at`). RLS on both tables + storage policies on `resumes` bucket.
- [ ] **05 Stripe Initialization** — Stripe client, India (₹10) and Global ($1.00) Price IDs, webhook handler for credit fulfillment.

### Phase 2 — Resume Workspace & Ingestion

- [ ] **06 Builder Page — Full UI** — Split-pane layout with Details Form (left) and PDF Canvas (right).
- [ ] **07 PDF Text Extraction** — `app/api/parser` route + `engine/extractor.ts` via `pdf-parse`.
- [ ] **08 AI Data Structurer** — DeepSeek V4-Flash at `app/api/structurer` + `engine/deepseek.ts`.
- [ ] **09 Draft State Management** — Debounced auto-save server action. Updates JSON and `selected_template` in InsForge.

### Phase 3 — Compilation & Preview

- [ ] **10 LaTeX Compiler + Harvard Template** — `app/api/compile` + `engine/compiler.ts` + `engine/templates/harvard/resume.tex` + `registry.ts`. Handlebars + pdflatex in isolated tmp dir.
- [ ] **11 Live Preview Rendering** — Frontend renders watermarked PDF buffer in right canvas panel.

### Phase 4 — Checkout & Fulfillment

- [ ] **12 Adaptive Checkout** — Download trigger detects region, routes to localized Stripe Checkout (UPI for IN, card globally).
- [ ] **13 High-Res Download Fulfillment** — `checkout/success` verifies credits, compiles unwatermarked PDF, saves to InsForge Storage, deducts credit, triggers download. 24-hour grace period.

### Phase 5 — Dashboard

- [ ] **14 Dashboard Page — Full UI** — Credit banner, Create New CTA, Resume Grid, funnel chart placeholders.
- [ ] **15 Dashboard Data Wiring** — Real `current_credits`, resume list from InsForge, Edit/Download actions.
- [ ] **16 Analytics Charts — PostHog Data** — Ingestions, previews, downloads charts wired to PostHog events via recharts.

### Phase 6 — Deployment

- [ ] **17 AWS Production Deployment** — Lightsail 2 GB + Docker + TeX Live + Cloudflare. AWS credits, billing alerts, InsForge OAuth redirects, Stripe webhook, all env vars. Compile concurrency guard. End-to-end smoke test.

---

## Environment Checklist

| Variable | Status | Note |
| -------- | ------ | ---- |
| `NEXT_PUBLIC_INSFORGE_URL` | **Set** | `https://7n9p3vut.ap-southeast.insforge.app` |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | **Set** | In `.env.local` (gitignored) |
| `NEXT_PUBLIC_APP_URL` | **Set (local)** | `http://localhost:3000` in `.env.local` |
| `DEEPSEEK_API_KEY` | **Missing** | DeepSeek V4-Flash API |
| `STRIPE_SECRET_KEY` | **Missing** | Server-side checkout creation |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | **Missing** | Frontend Stripe elements |
| `STRIPE_WEBHOOK_SECRET` | **Missing** | Webhook signature verification |
| `STRIPE_PRICE_ID_IN` | **Missing** | India ₹10 tier |
| `STRIPE_PRICE_ID_GLOBAL` | **Missing** | Global $1.00 tier |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` | **Missing** | PostHog project token (US Cloud) |
| `NEXT_PUBLIC_POSTHOG_HOST` | **Missing** | `https://us.i.posthog.com` |
| InsForge OAuth redirect URLs | **Not configured** | Add `http://localhost:3000/callback` + production `/callback` in InsForge dashboard Auth settings |
| AWS account + Lightsail 2 GB | **Not provisioned** | Ubuntu 22.04, `ap-south-1` or `us-east-1` |
| AWS billing budget alerts | **Not configured** | Set at $10 and $25 in AWS Budgets |
| AWS credits ($100 signup) | **Not claimed** | Paid plan; complete activities for up to $200 total |
| Cloudflare DNS + SSL | **Not configured** | Free tier, proxy to VM IP |
| Docker + TeX Live on VM | **Not installed** | Via Dockerfile — see architecture.md |

---

## Decisions Made During Build

- **Product name:** Render Resume (brand) — consistent across ui-rules, project-overview, and UI assets.
- **AI model:** DeepSeek V4-Flash via `openai` SDK pointed at `api.deepseek.com` — cost target under $0.001 per structuring run.
- **PDF extraction:** `pdf-parse` in Node.js API routes — no Python/FastAPI microservice. Runs on Lightsail instance alongside the app.
- **Production hosting:** AWS Lightsail 2 GB + Docker + Cloudflare ($12/mo, covered by AWS credits for ~6 months). Sized for ~100 users month 1, ~200–300 month 2.
- **PDF compilation:** Handlebars + pdflatex in Docker on Lightsail. Max 2 concurrent compiles (`MAX_COMPILE_CONCURRENCY`).
- **Payment:** Stripe pay-per-download only — no subscriptions. India gets UPI + card at ₹10, global gets card at $1.00.
- **Analytics:** PostHog with same wizard pattern as Job Snow — `instrumentation-client.ts`, `/ingest` proxy, `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`.
- **Auth:** InsForge OAuth via `@insforge/sdk/ssr` — server-owned cookies, `proxy.ts` + `updateSession`, OAuth API routes + `/callback`. `lib/auth.ts` (`getCurrentUser`, `requireUser`) for Server Components.
- **Grace period:** 24-hour free re-download after paying for a resume edit — `GRACE_PERIOD_HOURS` constant in `lib/utils.ts`.

---

## Notes

- Context files were originally generated separately in Gemini chat and lacked cross-file integrity. Aligned to Job Snow patterns on 2026-06-21.
- InsForge handles auth, DB, and storage — same as Job Snow. App runs on AWS Lightsail due to pdflatex requirement.
- Do not use AWS t3.micro / 1 GB Lightsail for production — TeX Live + Node will OOM under compile load.
- Do not use Lambda / App Runner / Fargate — no pdflatex, cold starts on TeX Live images.
- Set AWS billing budget alerts before deploying — credits cover ~6 months at $12/mo but other services can burn credits fast.
- Fallback without LaTeX: InsForge `create-deployment` + `@react-pdf/renderer` (architecture.md Path B).

---

## Template Checklist (Harvard — Launch)

- [ ] Download Harvard source from Overleaf → `engine/templates/harvard/resume.tex`
- [ ] Convert static content to Handlebars placeholders (see TEMPLATES.md)
- [ ] Create `engine/templates/registry.ts` with Harvard as default
- [ ] Add watermark handling in `_shared/` or inline in template
- [ ] Generate thumbnail → `public/templates/thumbnails/harvard.png`
- [ ] Verify compile locally via Docker before AWS deploy
- [ ] Wire TemplatePicker to `getActiveTemplates()` from registry

Future templates: follow checklist in `TEMPLATES.md` — one folder + registry entry + thumbnail per template.
- Stripe webhooks require Stripe CLI forwarding during local dev: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- OAuth failures after provider redirect are usually caused by missing allowed redirect URLs in InsForge auth settings (`http://localhost:3000/callback`).
