# Memory — Homepage UI + Auth (Job Snow pattern)

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

## Decisions made

- **Auth follows Job Snow** — `@insforge/sdk/ssr`, server-owned cookies, `proxy.ts`, `/callback` (not client-only SDK).
- **OAuth redirect URL in InsForge** — `/callback` (not `/dashboard`).
- **Navbar** — `isAuthenticated` prop; logout via `/api/auth/logout`.

## Current state

- **Works:** Homepage, login, dashboard (server-rendered), `proxy.ts` in build output.
- **Manual step:** Add `http://localhost:3000/callback` to InsForge allowed redirect URLs.
- **Next:** Feature 03 PostHog — identify on login, reset on logout.

## Next session starts with

1. Configure InsForge redirect URL: `http://localhost:3000/callback`
2. Smoke-test OAuth end-to-end
3. Build Feature 03 PostHog
