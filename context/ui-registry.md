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

```text
header: sticky top-0 z-50 border-b border-border-light bg-page/90 backdrop-blur-md
container: mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 md:px-8
sign-in button: inline-flex h-11 items-center justify-center rounded-md border border-border-light bg-surface px-4 text-sm font-semibold text-text-primary hover:bg-surface-secondary
dashboard link: same as sign-in button
sign-out button: inline-flex h-11 rounded-md bg-primary px-4 text-sm font-semibold text-text-inverse shadow-md hover:bg-primary-hover
auth-aware: Sign In when logged out; Dashboard + Sign Out when logged in (`isAuthenticated` prop)
```

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

### Dashboard placeholder — `app/dashboard/page.tsx`

```text
server component with requireUser()
Navbar: isAuthenticated prop
eyebrow: font-mono text-[13px] font-medium uppercase tracking-[0.12em] text-text-secondary
title: text-3xl md:text-4xl font-bold text-text-primary
body: text-base leading-relaxed text-text-secondary
secondary CTA: inline-flex h-11 rounded-md border border-border-light bg-surface px-4 text-sm font-semibold text-text-primary hover:bg-surface-secondary
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
