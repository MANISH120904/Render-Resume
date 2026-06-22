import Link from "next/link";

import { Navbar } from "@/components/layout/Navbar";
import { requireUser } from "@/lib/auth";
import { MOCK_DASHBOARD_DATA } from "@/lib/mock/dashboard";
import { getUserProfile } from "@/lib/profile";

export default async function BuilderPage() {
  const user = await requireUser();
  const profile = await getUserProfile(user.id);
  const displayName =
    profile?.fullName ??
    user.profile?.name ??
    user.email?.split("@")[0] ??
    "User";
  const creditBalance =
    profile?.currentCredits ?? MOCK_DASHBOARD_DATA.creditBalance;

  return (
    <>
      <Navbar
        isAuthenticated
        activePath="builder"
        creditBalance={creditBalance}
        userName={displayName}
      />

      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-4 py-10 md:px-8">
        <p className="font-mono text-[13px] font-medium uppercase tracking-[0.12em] text-text-secondary">
          Builder
        </p>

        <h1 className="text-3xl font-bold text-text-primary md:text-4xl">
          Resume workspace
        </h1>

        <p className="max-w-2xl text-base leading-relaxed text-text-secondary">
          The split-pane editor ships in Feature 06. This placeholder keeps
          navigation working while the dashboard UI is in review.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-md border border-border-light bg-surface px-4 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-secondary"
          >
            Back to dashboard
          </Link>
        </div>
      </main>
    </>
  );
}
