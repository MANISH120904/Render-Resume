# Code Standards

Implementation rules and conventions for the entire project. The AI agent must follow these in every session without exception. These rules prevent pattern drift across sessions.

---

## Engineering Mindset

The AI agent on this project operates as a senior engineer. This means:

- **Think before implementing** — understand what is being built and why before writing a single line
- **Read context files first** — never assume, always verify against architecture.md and project-overview.md
- **Scope is sacred** — only build what the current feature requires. Never go beyond scope even if it seems helpful
- **Cost-efficiency is the priority** — never default to heavy AI generation if a deterministic script (Handlebars templating or pdf-parse extraction) can do it for free
- **Every feature must be testable** — if it cannot be verified immediately after implementation, it is incomplete
- **Clean over clever** — simple readable code that a junior developer can understand is always preferred over clever abstractions
- **One thing at a time** — complete one feature fully before touching the next
- **Failures are expected** — wrap engine operations in try/catch, log failures, never let one compilation failure crash the UI

---

## TypeScript

- Strict mode enabled in `tsconfig.json` — no exceptions
- Never use `any` — use `unknown` and narrow the type
- Never use type assertions (`as SomeType`) unless absolutely necessary and commented why
- All function parameters and return types must be explicitly typed
- Use `type` for object shapes and unions — use `interface` only for extendable component props
- All async functions must have proper error handling — never let promises float unhandled
- Use `const` by default — only use `let` when reassignment is necessary

---

## Next.js 16 Conventions

- App Router only — no Pages Router
- React 19 — use React 19 APIs throughout
- All components are Server Components by default
- Only add `"use client"` when the component requires:
  - useState or useReducer
  - useEffect
  - Browser APIs
  - Event listeners
  - Third party client-only libraries (PostHog browser side)
- Never add `"use client"` to layout files unless absolutely required
- Data fetching happens in Server Components — never fetch in Client Components directly
- Route handlers live in `app/api/` — delegate business logic to `engine/`
- Server Actions live in `actions/` — never define Server Actions inline in components
- Caching is uncached by default — all dynamic code runs at request time
- Route protection via root `proxy.ts` + `updateSession` — not client-side guards
- Always read Next.js documentation before implementing any Next.js specific feature

---

## File and Folder Naming

- Folders: kebab-case — `workspace`, `checkout`
- Component files: PascalCase — `DetailsForm.tsx`, `LivePreview.tsx`
- Utility files: camelCase — `stripe.ts`, `posthog-client.ts`
- Type files: camelCase — `index.ts`
- API route files: always `route.ts`
- Server Action files: camelCase — `resume.ts`, `credits.ts`
- Engine files: camelCase — `compiler.ts`, `deepseek.ts`
- One component per file — never export multiple components from one file
- Index files only in `components/ui/` — never barrel export from other folders

---

## Component Structure

Every component follows this exact order:

```typescript
"use client"; // only if needed

// 1. External imports
import { useState } from "react";
import { Button } from "@/components/ui/button";

// 2. Internal imports
import { DownloadTrigger } from "@/components/checkout/DownloadTrigger";

// 3. Type definitions
type Props = {
  resumeId: string;
  creditBalance: number;
};

// 4. Component
export function BuilderToolbar({ resumeId, creditBalance }: Props) {
  // state
  // derived values
  // handlers
  // return JSX
}
```

- Never use default exports for components — always named exports
- Props type defined directly above the component — not in a separate types file unless shared
- No inline styles — all styling via Tailwind classes using CSS variables from ui-tokens.md

---

## API Route Handlers

```typescript
// app/api/structurer/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { extractJsonWithDeepseek } from "@/engine/deepseek";

export async function POST(req: NextRequest) {
  try {
    const insforge = await createInsforgeServer();
    const { data } = await insforge.auth.getCurrentUser();
    if (!data?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    // validate body
    const result = await extractJsonWithDeepseek(body.text);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[api/structurer]", error);
    return NextResponse.json(
      { success: false, error: "Failed to structure resume data." },
      { status: 500 },
    );
  }
}
```

- Every route handler has a try/catch
- Every route handler validates the request body before processing
- Errors are logged with the route path as prefix: `[api/structurer]`
- Always return `{ success: boolean, data?: T, error?: string }`
- Never return raw data without the success wrapper

---

## Server Actions

```typescript
// actions/resume.ts

"use server";

import { revalidatePath } from "next/cache";
import { createInsforgeServer } from "@/lib/insforge-server";

export async function saveDraft(resumeId: string, formData: unknown) {
  try {
    const insforge = await createInsforgeServer();
    const { data } = await insforge.auth.getCurrentUser();
    if (!data?.user) return { success: false, error: "Unauthorized" };
    // validate formData against ResumeSchema
    // write to DB

    revalidatePath("/builder");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[actions/resume]", error);
    return { success: false, error: "Failed to save draft" };
  }
}
```

- Every Server Action has a try/catch
- Every Server Action returns `{ success: boolean, error?: string }`
- Always call `revalidatePath` after mutations that affect page data
- Never throw from Server Actions — always return the error

---

## Engine Code

```typescript
// engine/compiler.ts

export async function compileLatexToPdf(
  jsonData: ResumeData,
  templateId: string,
  applyWatermark: boolean,
): Promise<{ success: boolean; buffer?: Buffer; error?: string }> {
  try {
    // 1. Load Handlebars template
    // 2. Inject jsonData
    // 3. Execute child_process for pdflatex in tmp/[uuid]/
    // 4. Return Buffer, clean up in finally

    return { success: true, buffer: pdfBuffer };
  } catch (error) {
    console.error("[engine/compiler]", error);
    return { success: false, error: "LaTeX compilation failed" };
  }
}
```

- Every engine function returns `{ success: boolean, error?: string }`
- Every engine function has a try/catch
- Engine functions never import from `components/` or `actions/`
- Engine functions never use React hooks or browser APIs
- pdflatex tmp directories must always be cleaned up in a `finally` block

---

## InsForge Client Usage

```typescript
// Browser context — Storage, Realtime in Client Components
import { insforge } from "@/lib/insforge-client";

// Server context — Server Components, Route Handlers, Server Actions
import { createInsforgeServer } from "@/lib/insforge-server";
const insforge = await createInsforgeServer();

// Auth helpers — Server Components
import { getCurrentUser, requireUser } from "@/lib/auth";
```

- Never use the browser client in server context
- Never use the server client in browser context
- Always await `createInsforgeServer()` — it reads cookies asynchronously
- Always scope every query to the current `user_id` — never query without a user filter

---

## Error Handling

- Never use empty catch blocks — always log or handle
- Console errors always include context prefix: `[component/function name]`
- User-facing errors must be human readable — never expose raw LaTeX logs or API keys
- API route errors return `status: 500` with generic message — never expose internals

---

## PostHog Events

All PostHog events must use these exact event names. Never invent new event names without adding them here first.

| Event               | When                                      | Key Properties              |
| ------------------- | ----------------------------------------- | --------------------------- |
| `ingestion_started` | User uploads PDF or pastes text           | userId, method              |
| `draft_structured`  | DeepSeek successfully returns JSON        | userId, resumeId            |
| `preview_rendered`  | pdflatex compiles a watermarked draft     | userId, templateId          |
| `checkout_started`  | User clicks Download High-Res PDF         | userId, regionCode          |
| `resume_downloaded` | Clean PDF retrieved from InsForge Storage | userId, resumeId            |

These five events are the only events in this project. Do not add more without updating this list first.

`ingestion_started` powers the Ingestions Over Time dashboard chart.
`preview_rendered` powers the Previews Rendered dashboard chart.
`resume_downloaded` powers the Downloads Completed dashboard chart.
Always fire these with correct properties.

---

## Environment Variables

All environment variables defined in `.env.local` for development. Never hardcode any key, URL, or secret anywhere in the codebase.

| Variable                              | Used In                    |
| ------------------------------------- | -------------------------- |
| `NEXT_PUBLIC_INSFORGE_URL`            | lib/insforge-client.ts, lib/insforge-server.ts |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY`       | lib/insforge-client.ts, lib/insforge-server.ts |
| `NEXT_PUBLIC_APP_URL`                 | Stripe success/cancel URLs |
| `DEEPSEEK_API_KEY`                    | engine/deepseek.ts         |
| `STRIPE_SECRET_KEY`                   | lib/stripe.ts, api/stripe/ |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`  | Frontend Stripe elements   |
| `STRIPE_WEBHOOK_SECRET`               | api/stripe/webhook/        |
| `STRIPE_PRICE_ID_IN`                  | api/stripe/checkout/       |
| `STRIPE_PRICE_ID_GLOBAL`              | api/stripe/checkout/       |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`   | lib/posthog-client.ts      |
| `NEXT_PUBLIC_POSTHOG_HOST`            | lib/posthog-client.ts      |

`NEXT_PUBLIC_` prefix means the variable is exposed to the browser. Never add `NEXT_PUBLIC_` to secret keys.

---

## Global Constants

Business rules defined once in `lib/utils.ts`. Never hardcode these values elsewhere.

```typescript
// lib/utils.ts
export const GRACE_PERIOD_HOURS = 24;
export const MAX_COMPILE_CONCURRENCY = 2;
```

Import and use `GRACE_PERIOD_HOURS` when calculating if a re-download requires another credit.

Import and use `MAX_COMPILE_CONCURRENCY` in `app/api/compile/route.ts` to queue or reject compiles when the Lightsail instance is at capacity. On a 2 GB instance, more than 2 simultaneous pdflatex runs risk OOM.

---

## Template IDs

Template ids are defined once in `engine/templates/registry.ts`. Never hardcode template names in components or compiler.

| Rule | Example |
| ---- | ------- |
| Lowercase kebab-case | `harvard`, `two-column` |
| Folder matches id | `engine/templates/harvard/` → `"harvard"` |
| Default for new drafts | `DEFAULT_TEMPLATE_ID` in registry |

Full template workflow: see `TEMPLATES.md`.

---

## Import Aliases

Always use the `@/` alias — never use relative imports that go up more than one level.

```typescript
// Correct
import { Button } from "@/components/ui/button";
import { compileLatexToPdf } from "@/engine/compiler";

// Never
import { Button } from "../../../components/ui/button";
```

---

## Comments

- No comments explaining what the code does — code must be self-explanatory
- Comments only for why — explaining a non-obvious decision
- DeepSeek prompt logic may have a brief comment explaining schema constraints
- Never leave TODO comments in committed code

---

## Dependencies

Never install a new package without a clear reason. Before installing anything check:

1. Does shadcn/ui already have this component?
2. Does Next.js already provide this functionality?
3. Is there a simpler native solution?

Approved dependencies for this project:

- `@insforge/sdk` — InsForge client (`@insforge/sdk` + `@insforge/sdk/ssr`)
- `openai` — SDK pointed at DeepSeek API endpoints
- `stripe` — Payment infrastructure
- `pdf-parse` — Server-side PDF text extraction
- `handlebars` — JSON → `.tex` template injection
- `posthog-js` — PostHog browser client
- `posthog-node` — PostHog server client
- `recharts` — Dashboard funnel charts
- `zod` — Schema validation
- `lucide-react` — Icons
- `tailwindcss` — Styling
- `shadcn/ui` components — UI primitives
- `react-pdf` (optional) — PDF preview if native `<embed>` is insufficient

Do not install any other packages without updating this list first.
