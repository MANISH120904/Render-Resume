# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following ui-rules.md and ui-tokens.md, then add it here

After building any component — update this file with the component name, file path, and exact classes used.

---

## Components

### BrandLogo — `components/layout/BrandLogo.tsx`

```text
wrapper: flex items-center gap-2
braces: font-mono text-2xl font-semibold leading-none text-primary (light) | text-text-inverse (inverse)
wordmark: text-lg font-bold text-text-primary (light) | text-text-inverse (inverse)
```

### Navbar — `components/layout/Navbar.tsx`

Last updated: 2026-06-22

| Property | Class |
| -------- | ----- |
| Background | `bg-page/90 backdrop-blur-md` |
| Border | `border-b border-border-light` |
| Border radius | none (full-width header) |
| Text — primary | `text-text-primary` (active nav, sign out) |
| Text — secondary | `text-text-secondary` (inactive nav links) |
| Spacing | `h-16`, container `px-4 md:px-8`, actions `gap-3`, nav links `gap-6` |
| Hover state | nav: `hover:text-text-primary`; sign in: `hover:bg-surface-secondary` |
| Shadow | n/a (authenticated layout uses text sign out) |
| Accent usage | CreditBadge via `CreditBadge` component |

```text
header: sticky top-0 z-50 border-b border-border-light bg-page/90 backdrop-blur-md
container: mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 md:px-8
left cluster: BrandLogo + nav (Dashboard, Builder) when authenticated — `hidden sm:flex gap-6`
nav link active: text-sm font-medium text-primary
nav link inactive: text-sm font-medium text-text-secondary hover:text-text-primary
logged in nav: flex items-center gap-4 md:gap-6 (visible on all breakpoints)
logged out: Sign In bordered button (h-11)
logged in: CreditBadge + UserAvatar + LogoutButton text link ("Sign Out")
props: isAuthenticated, activePath ("dashboard" | "builder"), creditBalance?, userName?
```

**Pattern notes:**
Authenticated nav uses inline text links (not bordered buttons) for Dashboard/Builder. Sign Out is a text button via LogoutButton — not the filled primary pattern used on the login-era navbar.

### CreditBadge — `components/dashboard/CreditBadge.tsx`

Last updated: 2026-06-22

```text
badge: inline-flex items-center gap-1.5 rounded-full bg-primary-light px-3 py-1 text-sm font-medium text-primary
dot: h-1.5 w-1.5 rounded-full bg-primary
```

### UserAvatar — `components/dashboard/UserAvatar.tsx`

Last updated: 2026-06-22

```text
avatar: inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface-secondary text-xs font-semibold text-text-secondary
```

### CreditBanner — `components/dashboard/CreditBanner.tsx`

Last updated: 2026-06-22

```text
section: flex w-full flex-col gap-4 rounded-xl bg-inverse p-6 sm:flex-row sm:items-center sm:justify-between
left cluster: flex items-center gap-4 (number + two-line copy vertically centered)
metric: shrink-0 text-5xl font-semibold leading-none text-text-inverse
label: text-sm font-medium leading-5 text-text-inverse
subtext: text-sm leading-relaxed text-text-tertiary
CTA: inline-flex h-11 shrink-0 self-start cursor-not-allowed opacity-70 sm:self-center rounded-md bg-surface px-5 (disabled until Stripe)
```

### CreateNewResumeCard — `components/dashboard/CreateNewResumeCard.tsx`

Last updated: 2026-06-22

```text
section: flex flex-col gap-4 rounded-lg border border-border-light bg-surface p-6 card-shadow sm:flex-row sm:items-center sm:justify-between
icon wrap: flex h-12 w-12 rounded-full bg-primary-muted, braces font-mono text-lg text-primary
title: text-lg font-semibold text-text-primary
description: text-sm leading-relaxed text-text-secondary
CTA: inline-flex h-11 rounded-md bg-primary px-5 text-sm font-semibold text-text-inverse shadow-md hover:bg-primary-hover → /builder
```

### ResumeCard — `components/dashboard/ResumeCard.tsx`

Last updated: 2026-06-22

```text
article: flex flex-col overflow-hidden rounded-lg border border-border-light bg-surface card-shadow
preview outer: relative bg-canvas p-4
preview inner: relative overflow-hidden rounded-md border border-border-light bg-surface p-4
template label: font-mono text-xs font-medium text-primary
status dot: absolute right-3 top-3 h-2 w-2 rounded-full bg-primary
skeleton lines: h-2 rounded-full bg-sunken (varying widths)
title: text-base font-semibold text-text-primary
meta: font-mono text-xs text-text-secondary
edit link: text-sm font-semibold text-text-primary hover:opacity-80
download button: inline-flex h-11 cursor-not-allowed opacity-70 rounded-md border border-border-light bg-surface px-4 (disabled until checkout)
```

### FunnelCharts — `components/dashboard/FunnelCharts.tsx`

Last updated: 2026-06-22

```text
section: flex flex-col gap-4
header title: text-lg font-semibold text-text-primary
header note: text-sm text-text-secondary
grid: grid gap-4 lg:grid-cols-3
chart card: rounded-lg border border-border-light bg-surface p-6 card-shadow
chart title: text-base font-semibold text-text-primary
chart area: h-[220px] ResponsiveContainer
area chart stroke: var(--color-primary), fill var(--color-primary-muted)
bar chart previews: fill var(--color-primary)
bar chart downloads: fill var(--color-success)
grid lines: stroke var(--color-border-light) strokeDasharray 4 4
mock data until Feature 16 PostHog wiring
```

### ResumeGrid empty state — `components/dashboard/ResumeGrid.tsx`

```text
empty wrap: flex flex-col items-center gap-4 rounded-lg border border-border-light bg-surface p-10 text-center card-shadow
empty icon wrap: h-12 w-12 rounded-full bg-primary-muted, FileText h-5 w-5 text-primary
empty title: text-base font-semibold text-text-primary
empty body: text-sm text-text-secondary max-w-sm
empty CTA: h-11 bg-primary → /builder "Upload your first resume"
```

### ResumeGrid — `components/dashboard/ResumeGrid.tsx`

Last updated: 2026-06-22

```text
section: flex flex-col gap-4
header row: flex flex-wrap items-center justify-between gap-2
title: text-lg font-semibold text-text-primary
meta: font-mono text-xs text-text-secondary ("N drafts · all ATS-safe")
grid: grid gap-4 sm:grid-cols-2 lg:grid-cols-3
```

### Dashboard page — `app/dashboard/page.tsx`

Last updated: 2026-06-22

```text
page: requireUser() server component
Navbar: isAuthenticated, activePath="dashboard", creditBalance + userName from mock
main: mx-auto max-w-[1200px] flex flex-col gap-6 px-4 py-8 md:px-8 md:py-10
sections: CreditBanner → CreateNewResumeCard → ResumeGrid → FunnelCharts (mock data + profile credits when available)
```

### LogoutButton — `components/auth/LogoutButton.tsx`

Last updated: 2026-06-22

| Property | Class |
| -------- | ----- |
| Background | inherited via `className` prop |
| Border | inherited via `className` prop |
| Border radius | inherited via `className` prop |
| Text — primary | inherited via `className` prop |
| Text — secondary | n/a |
| Spacing | inherited via `className` prop |
| Hover state | inherited via `className` prop |
| Shadow | inherited via `className` prop |
| Accent usage | inherited via `className` prop |

```text
wrapper: <form action="/api/auth/logout" method="post">
button: type="submit", className passed from parent (no default styles)
behavior: calls posthog.reset() on submit before server logout
```

**Pattern notes:**
LogoutButton is a behavioral wrapper only — it never defines its own visual classes. Parent components (currently Navbar) pass the primary button pattern via `className`. Reuse Navbar's primary button classes when placing LogoutButton elsewhere.


### Login page — `app/(auth)/login/page.tsx` + `components/auth/LoginCard.tsx`

```text
page: flex min-h-screen flex-col items-center justify-center bg-page px-4
card: w-full max-w-md rounded-lg border border-border-light bg-surface p-8 card-shadow
eyebrow: font-mono text-[13px] font-medium uppercase tracking-[0.12em] text-text-secondary
title: mt-2 text-2xl font-bold text-text-primary
subtitle: mt-2 text-sm leading-relaxed text-text-secondary
oauth button: inline-flex h-11 w-full gap-2 rounded-md border border-border-light bg-surface px-4 text-sm font-semibold text-text-primary hover:bg-surface-secondary
error: text-sm text-error
oauth: form GET to /api/auth/oauth/google|github
```

### Footer — `components/layout/Footer.tsx`

```text
footer: mt-12 w-full bg-inverse text-text-inverse
main container: mx-auto max-w-[1200px] px-6 py-10 md:px-12
columns wrapper: flex flex-col justify-between gap-10 lg:flex-row
column header: font-mono text-xs font-medium uppercase tracking-[0.08em] text-text-tertiary
column link: text-sm text-text-inverse hover:opacity-80
bottom bar: mt-10 flex border-t border-border-strong pt-5 text-xs text-text-tertiary
```

### Hero — `components/homepage/Hero.tsx`

```text
eyebrow: font-mono text-[13px] font-medium uppercase tracking-[0.12em] text-text-secondary
headline: max-w-[760px] text-[40px] md:text-[56px] font-extrabold leading-[1.02] tracking-[-0.02em] text-text-primary
subhead: max-w-[760px] text-lg leading-relaxed text-text-secondary
primary CTA: inline-flex h-11 gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-text-inverse shadow-md hover:bg-primary-hover
ghost CTA: inline-flex h-11 px-2 text-sm font-semibold text-text-primary hover:opacity-80
```

### HeroVisual — `components/homepage/HeroVisual.tsx`

```text
raw card: rounded-lg border border-border-light bg-sunken p-6
raw code area: rounded-md border border-border-light bg-surface p-5 font-mono text-sm
compile arrow: font-mono text-2xl text-primary
preview card: rounded-lg border border-border-light bg-surface shadow-[0_1px_4px_rgba(10,13,18,0.06)]
watermark braces: font-mono text-5xl text-primary/10 rotate -30deg
section label: font-mono text-[13px] uppercase tracking-[0.12em] text-primary
```

### Features — `components/homepage/Features.tsx`

```text
eyebrow: font-mono text-[13px] font-medium uppercase tracking-[0.12em] text-text-secondary
card: rounded-lg border border-border-light bg-surface p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]
icon wrap: flex h-10 w-10 items-center justify-center rounded-full bg-primary-muted
icon: h-5 w-5 text-primary
title: text-lg font-semibold text-text-primary
description: text-sm leading-relaxed text-text-secondary
```

### PricingTable — `components/homepage/PricingTable.tsx`

```text
eyebrow: font-mono text-[13px] font-medium uppercase tracking-[0.12em] text-text-secondary
card: rounded-lg border border-border-light bg-surface p-6 card-shadow
highlight card: border-primary primary-glow
price: font-mono text-xl font-medium text-primary
CTA: inline-flex h-11 rounded-md bg-primary px-4 text-sm font-semibold text-text-inverse shadow-md hover:bg-primary-hover
```

### ThemeToggle — `components/theme/ThemeToggle.tsx`

```text
button: relative inline-flex h-11 w-11 rounded-md border border-border-light bg-surface hover:bg-surface-secondary
icons: Sun/Moon with rotate/scale transition (lucide-react)
```

### Dark mode tokens — `app/globals.css`

```text
Toggle: .dark class on <html> swaps --token-* CSS variables
Paper preview: bg-paper text-paper-foreground text-paper-muted (stays light in both themes)
Utilities: card-shadow, elevated-shadow, primary-glow
Navbar: bg-page/90 backdrop-blur-md
Body dark: subtle blue radial hero-glow at top
```
