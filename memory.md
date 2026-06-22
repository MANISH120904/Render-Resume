# Memory — Homepage UI + Auth + PostHog

Last updated: 2026-06-22

## What was built

**Homepage (Feature 01 — complete UI)**

- `app/page.tsx` — assembles full landing page
- `components/layout/Navbar.tsx` — sticky navbar, `isAuthenticated` prop, theme toggle
- `components/layout/Footer.tsx`, `BrandLogo.tsx`, homepage sections

**Dark mode**

- `lib/theme.ts`, `ThemeProvider`, `ThemeToggle`, token-driven `globals.css`

**Auth (Feature 02 — Job Snow / `@insforge/sdk/ssr` pattern)**

- `proxy.ts` — `updateSession` + redirect unauthenticated users from protected routes
- `lib/insforge-client.ts` — `createBrowserClient({ refreshUrl: "/api/auth/refresh" })`
- `lib/insforge-server.ts` — `createServerClient({ cookies })`
- `lib/auth.ts` — `getCurrentUser()`, `requireUser()`
- `app/api/auth/oauth/[provider]/route.ts` — server OAuth start
- `app/(auth)/callback/route.ts` — `exchangeOAuthCode` + `setAuthCookies`
- `app/api/auth/refresh/route.ts` — `createRefreshAuthRouter`
- `app/api/auth/logout/route.ts` — sign out + `clearAuthCookies`
- `app/(auth)/login/page.tsx` — Server Component + `LoginCard` (form GET to OAuth routes)
- `app/dashboard/page.tsx` — Server Component with `requireUser()`
- Removed: `AuthProvider`, `ProtectedRoute`, `app/(protected)/`

**PostHog (Feature 03)**

- `instrumentation-client.ts` — browser init via `/ingest` proxy, US Cloud host
- `lib/posthog-client.ts` — `identifyUser`, `resetUser`, re-export `posthog`
- `lib/posthog-server.ts` — `createPostHogServer()` with `flushAt: 1`, `flushInterval: 0`
- `next.config.ts` — `/ingest` reverse proxy to `NEXT_PUBLIC_POSTHOG_HOST`
- `components/analytics/PostHogProvider.tsx` — identify on session, manual `$pageview`
- `components/auth/LogoutButton.tsx` — `posthog.reset()` before logout POST
- `app/layout.tsx` — wraps app in `PostHogProvider` with user from `getCurrentUser()`
- Env: `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`, `NEXT_PUBLIC_POSTHOG_HOST` (US Cloud project `480946`)

## Decisions made

- **Auth follows Job Snow** — `@insforge/sdk/ssr`, server-owned cookies, `proxy.ts`, `/callback` (not client-only SDK).
- **OAuth redirect URL in InsForge** — `/callback` (not `/dashboard`).
- **Navbar** — `isAuthenticated` prop; logout via `LogoutButton` (resets PostHog).
- **PostHog** — same wizard pattern as Job Snow; project ID `480946` noted for Phase 16 API queries (not needed in client init).

## Current state

- **Works:** Homepage, login, dashboard (server-rendered), `proxy.ts` in build output, PostHog init + identify/reset.
- **Manual step:** Add `http://localhost:3000/callback` to InsForge allowed redirect URLs.
- **Next:** Feature 04 Database Schema — `profiles`, `resumes`, storage bucket, RLS.

## Next session starts with

1. Configure InsForge redirect URL: `http://localhost:3000/callback`
2. Smoke-test OAuth + PostHog (check Live Events in PostHog dashboard after login/logout)
3. Build Feature 04 Database Schema
