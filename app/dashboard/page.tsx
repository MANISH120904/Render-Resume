import Link from "next/link";

import { Navbar } from "@/components/layout/Navbar";
import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireUser();
  const displayName =
    user.profile?.name ?? user.email?.split("@")[0] ?? "there";

  return (
    <>
      <Navbar isAuthenticated />
      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-4 py-10 md:px-8">
        <p className="font-mono text-[13px] font-medium uppercase tracking-[0.12em] text-text-secondary">
          Dashboard
        </p>

        <h1 className="text-3xl font-bold text-text-primary md:text-4xl">
          Welcome back, {displayName}
        </h1>

        <p className="max-w-2xl text-base leading-relaxed text-text-secondary">
          You&apos;re signed in as{" "}
          <span className="font-medium text-text-primary">{user.email}</span>.
          The full dashboard UI ships in Feature 14 — this page confirms OAuth
          and route protection are working.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-md border border-border-light bg-surface px-4 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-secondary"
          >
            Back to homepage
          </Link>
        </div>
      </main>
    </>
  );
}
