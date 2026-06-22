# Library Docs

Project-specific usage patterns for every third party library in this project. This file only covers how we use each library in this specific project — rules, patterns, and constraints specific to Render Resume.

Read the relevant section before implementing any feature that touches these libraries.

---

## Before Using Any Library

Before implementing any feature that uses a third party library:

1. **Check AGENTS.md** at the project root — it lists every skill installed for this project and how to use them. Skills contain up-to-date API documentation, usage patterns, and best practices specific to this codebase.

2. **Check if an MCP server is configured** for that library. If an MCP server is available — use it before falling back to general knowledge.

3. **Read this file** for project-specific patterns that override general library knowledge.

The order of authority is:

```
MCP server (real-time docs) → Skills via AGENTS.md → This file (project rules) → General training knowledge
```

Never rely on general training knowledge alone for library APIs — they change frequently and training data may be outdated.

---

## InsForge

**Check first:** Fetch InsForge docs via MCP before implementing or changing auth. Reference implementation: Job Snow (`proxy.ts`, `@insforge/sdk/ssr`).

### Client vs Server

Two separate instances — never mix them:

```typescript
// lib/insforge-client.ts — browser context (Storage, Realtime)
"use client";
import { createBrowserClient } from "@insforge/sdk/ssr";

export const insforge = createBrowserClient({
  refreshUrl: "/api/auth/refresh",
});
```

```typescript
// lib/insforge-server.ts — server context
import { cookies } from "next/headers";
import { createServerClient } from "@insforge/sdk/ssr";

export async function createInsforgeServer() {
  return createServerClient({ cookies: await cookies() });
}
```

**Rules:**

- Browser client — Client Components for Storage/Realtime only; auth mutations run on server
- Server client — Server Components, API routes, Server Actions
- Never use browser client for sign-in/sign-out — use `/api/auth/oauth/*` and `/api/auth/logout`
- Route protection via root `proxy.ts` + `updateSession` — not client guards

---

### Auth

```typescript
// Server Component — check session
import { getCurrentUser, requireUser } from "@/lib/auth";

const user = await getCurrentUser(); // null if logged out
const user = await requireUser(); // redirects to /login

// Login — form GET to server OAuth route (LoginCard)
<form action="/api/auth/oauth/google" method="get">...</form>

// Logout — link to server route
<Link href="/api/auth/logout">Sign Out</Link>
```

OAuth flow: `/api/auth/oauth/[provider]` → provider → `/callback` → `setAuthCookies` → `/dashboard`

InsForge allowed redirect URLs must include `/callback` (not `/dashboard`).

---

### DB Queries

```typescript
// Read user drafts
const { data, error } = await insforge
  .from("resumes")
  .select("*")
  .eq("user_id", user.id)
  .order("updated_at", { ascending: false });

// Upsert draft state
const { data: draft, error } = await insforge
  .from("resumes")
  .upsert({
    id: resumeId,
    user_id: user.id,
    resume_data: currentJsonData,
    selected_template: templateId,
  })
  .select()
  .single();
```

**Rules:**

- Always scope queries to `user_id` — never query without user filter
- Always handle the `error` return — never assume success
- Use `.single()` when expecting exactly one row

---

### Storage

```typescript
// Upload compiled clean PDF
const { data, error } = await insforge.storage
  .from("resumes")
  .upload(`resumes/${userId}/${resumeId}.pdf`, cleanPdfBuffer, {
    contentType: "application/pdf",
    upsert: true,
  });

// Get signed URL for download
const { data } = await insforge.storage
  .from("resumes")
  .createSignedUrl(`resumes/${userId}/${resumeId}.pdf`, 3600);
```

**Storage paths:**

- Clean PDF: `resumes/{user_id}/{resume_id}.pdf`

**Rules:**

- Always use `upsert: true` for PDF uploads — overwrites existing file
- Always save the storage path back to `target_storage_url` in the resumes table
- Never write files to persistent disk — upload buffer directly to storage
- Use signed URLs for downloads — bucket is private with RLS

---

### Deployment — AWS Lightsail (Production)

Production runs on **AWS Lightsail 2 GB + Docker + Cloudflare**, not InsForge `create-deployment`. InsForge handles auth, DB, and storage only.

**Deploy steps:**

1. Create AWS account — **Paid account plan** ($100 credits + up to $100 more from activities)
2. Set billing budget alerts at $10 and $25 in AWS Budgets
3. Create Lightsail instance: **Small (2 GB)**, Ubuntu 22.04, region `ap-south-1` or `us-east-1`
4. SSH in → install Docker + Docker Compose
5. Build Docker image (see `Dockerfile` in architecture.md)
6. Copy `.env.production` to instance — never commit secrets
7. Run `docker compose up -d --build`
8. Point Cloudflare DNS to Lightsail static IP
9. Set `NEXT_PUBLIC_APP_URL` to production domain

**Instance spec:** Lightsail Small — 2 vCPU, 2 GB RAM, 60 GB SSD ($12/mo). Alternative: EC2 t3.small (~$15/mo).

**AWS credits:** $100 on signup + up to $100 more = $200 total for 6 months. At $12/mo, credits cover the full window.

**Scale targets:** ~100 users month 1, ~200–300 month 2 on same instance. Limit concurrent pdflatex runs to 2 via `MAX_COMPILE_CONCURRENCY`.

**Do not use for production:**

- AWS t3.micro / 1 GB Lightsail — OOM under compile load
- Lambda / App Runner / Fargate — no pdflatex, unsuitable cold starts
- InsForge `create-deployment` — Vercel serverless, no pdflatex

**Fallback (Path B):** InsForge `create-deployment` + `@react-pdf/renderer` if AWS is blocked — loses LaTeX fidelity.

---

## DeepSeek API

We use the official `openai` SDK pointed at DeepSeek endpoints for structured JSON output.

### JSON Structuring Pattern

```typescript
// engine/deepseek.ts
import OpenAI from "openai";

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY!,
  baseURL: "https://api.deepseek.com/v1",
});

export async function extractJsonWithDeepseek(
  rawText: string,
): Promise<unknown> {
  const systemPrompt = `You are an expert ATS optimization engine. You accept raw, unstructured resume text and map it into a rigid structured schema.

You must output a single, complete JSON object containing:
- personalInfo (name, email, phone, website, location)
- experience (array: company, role, startDate, endDate, bullets)
- education (array: institution, degree, major, graduationDate)
- skills (array of strings)

Return ONLY valid JSON. Never output LaTeX or markdown.`;

  const response = await deepseek.chat.completions.create({
    model: "deepseek-chat",
    response_format: { type: "json_object" },
    temperature: 0.2,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: rawText },
    ],
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}
```

**Rules:**

- Model string is always `"deepseek-chat"`
- Temperature locked between `0.1` and `0.3` for reliable data mapping
- Always use `response_format: { type: "json_object" }`
- Parse response in try/catch — handle malformed JSON gracefully
- System prompt must explicitly ban LaTeX output
- Keep system prompt frozen across calls for context caching efficiency

---

## pdf-parse

Server-side PDF text extraction in Next.js API routes. Runs on the Lightsail instance — no separate microservice needed.

### Extraction Pattern

```typescript
// engine/extractor.ts
import pdf from "pdf-parse";

export async function extractTextFromPdf(
  buffer: Buffer,
): Promise<{ success: boolean; text?: string; error?: string }> {
  try {
    const parsed = await pdf(buffer);

    if (!parsed.text || parsed.text.trim().length < 20) {
      return {
        success: false,
        error: "Could not extract text from this PDF. Please paste text manually.",
      };
    }

    return { success: true, text: parsed.text };
  } catch (error) {
    console.error("[engine/extractor]", error);
    return { success: false, error: "Document content reading failed." };
  }
}
```

**Rules:**

- Server-side only — never import in client components
- `parsed.text` is raw unformatted text — DeepSeek handles structure extraction
- Always check for empty or very short text (image-based PDFs return empty)
- Never pass the PDF buffer to DeepSeek — extract text first

---

## Handlebars + pdflatex (Compilation Engine)

Deterministic JSON → LaTeX → PDF pipeline. Runs on the **Lightsail Docker container** with TeX Live installed.

### Core Compilation Pattern

```typescript
// engine/compiler.ts
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import Handlebars from "handlebars";

const execAsync = promisify(exec);

export async function compileLatex(
  jsonData: unknown,
  templateString: string,
  applyWatermark: boolean,
): Promise<Buffer> {
  const template = Handlebars.compile(templateString);
  const texContent = template({
    ...jsonData,
    watermarkEnabled: applyWatermark ? "\\watermarktrue" : "\\watermarkfalse",
  });

  const uniqueId = crypto.randomUUID();
  const tmpDir = path.join(process.cwd(), "tmp", uniqueId);
  fs.mkdirSync(tmpDir, { recursive: true });

  const texPath = path.join(tmpDir, "resume.tex");
  fs.writeFileSync(texPath, texContent);

  try {
    await execAsync(
      `pdflatex -interaction=batchmode -output-directory=${tmpDir} ${texPath}`,
    );

    const pdfPath = path.join(tmpDir, "resume.pdf");
    return fs.readFileSync(pdfPath);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}
```

**Rules:**

- Every run uses isolated `tmp/[uuid]/` directory
- Always clean up in `finally` block — zero directory leaks
- `-interaction=batchmode` prevents pdflatex from hanging on errors
- User-facing errors must be human readable — never expose raw CLI logs
- Template files live in `engine/templates/` — version-controlled in git, baked into Docker on deploy. See `TEMPLATES.md` for structure and how to add templates.
- Load templates via `engine/templates/registry.ts` — never hardcode paths in compiler or UI.
- Watermark flag controlled by caller — preview uses `true`, download uses `false`

### Production Dockerfile Requirement

```dockerfile
FROM node:20-bookworm
RUN apt-get update && apt-get install -y \
    texlive-latex-base \
    texlive-fonts-recommended \
    texlive-latex-extra \
    && rm -rf /var/lib/apt/lists/*
```

Without TeX Live in the Docker image, pdflatex fails with "command not found." The Lightsail instance runs this container — see architecture.md AWS Setup Checklist.

---

## LaTeX Templates

Full guide: **`TEMPLATES.md`**. Summary:

- Templates go in **`engine/templates/`** in the project repo — not a container volume, not InsForge Storage.
- Launch with **Harvard** (`engine/templates/harvard/resume.tex`) — import from Overleaf, replace static text with Handlebars placeholders matching `ResumeData` schema.
- Register every template in `engine/templates/registry.ts` with id, name, texPath, thumbnailPath, status.
- Thumbnails in `public/templates/thumbnails/{id}.png` for TemplatePicker.
- To add more templates: new folder + registry entry + thumbnail + Dockerfile package check + redeploy. Same JSON schema for all templates.
- `selected_template` in DB stores template **id** (e.g. `"harvard"`), not file path.
- Never rename template ids after users have drafts — add new templates instead.

---

## Stripe

Localized checkout based on geographic headers and user profile region.

### Adaptive Checkout

```typescript
// app/api/stripe/checkout/route.ts
const countryCode = req.headers.get("cf-ipcountry") || "US";
const isIndia = countryCode === "IN";
const priceId = isIndia
  ? process.env.STRIPE_PRICE_ID_IN!
  : process.env.STRIPE_PRICE_ID_GLOBAL!;

const session = await stripe.checkout.sessions.create({
  payment_method_types: isIndia ? ["upi", "card"] : ["card"],
  line_items: [{ price: priceId, quantity: 1 }],
  mode: "payment",
  metadata: { userId: user.id },
  success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/builder`,
});
```

### Webhook Credit Fulfillment

```typescript
// app/api/stripe/webhook/route.ts
// On checkout.session.completed:
await insforge
  .from("profiles")
  .update({ current_credits: profile.current_credits + 1 })
  .eq("id", userId);
```

**Rules:**

- Always pass `userId` in session `metadata` for webhook verification
- India (`IN`) must include `"upi"` in `payment_method_types`
- Use `mode: "payment"` only — no subscriptions
- Verify webhook signature with `STRIPE_WEBHOOK_SECRET`
- Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

---

## PostHog

**Check first:** Check AGENTS.md for an installed PostHog skill. Same wizard pattern as Job Snow.

### Client Setup (Browser)

```typescript
// lib/posthog-client.ts
import posthog from "posthog-js";

export function initPostHog() {
  if (typeof window !== "undefined") {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
      capture_pageview: false,
    });
  }
}

// Capture event client-side
posthog.capture("ingestion_started", {
  userId,
  method: "upload",
});
```

### Server Setup

```typescript
// lib/posthog-server.ts
import { PostHog } from "posthog-node";

export const createPostHogServer = () =>
  new PostHog(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
    flushAt: 1,
    flushInterval: 0,
  });

const posthog = createPostHogServer();
posthog.capture({
  distinctId: userId,
  event: "draft_structured",
  properties: { userId, resumeId },
});
await posthog.shutdown();
```

### Next.js Wizard Setup

```typescript
// instrumentation-client.ts
import posthog from "posthog-js";

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
  api_host: "/ingest",
  ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
  capture_pageview: false,
});
```

```typescript
// next.config.ts — reverse proxy
async rewrites() {
  return [
    {
      source: "/ingest/:path*",
      destination: `${process.env.NEXT_PUBLIC_POSTHOG_HOST}/:path*`,
    },
  ];
}
```

**Rules:**

- Always call `await posthog.shutdown()` in server-side functions
- `flushAt: 1` and `flushInterval: 0` always set on server client
- Event names must match exactly the list in `code-standards.md`
- Always include `userId` as a property on every server-side event
- Call `posthog.identify(userId)` after login on client side
- Call `posthog.reset()` on logout on client side
- Use `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` — same env var name as Job Snow

---

## recharts

Dashboard funnel charts on `/dashboard`.

```typescript
// components/dashboard/FunnelCharts.tsx
"use client";

import { AreaChart, Area, BarChart, Bar, ResponsiveContainer } from "recharts";

// Colors use CSS variable references for token consistency
<Area stroke="var(--color-primary)" strokeWidth={3} />
<Bar fill="var(--color-success)" radius={[4, 4, 0, 0]} />
```

**Rules:**

- All chart components are `"use client"` (recharts needs browser)
- Colors use `var(--color-*)` references — never hardcoded hex in chart props
- Chart height container: `h-[220px]` with `ResponsiveContainer width="100%" height="100%"`
- Grid lines: `stroke="var(--color-border-light)"`, `strokeDasharray="4 4"`
- Empty state when no PostHog data exists yet
