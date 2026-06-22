import Link from "next/link";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { CreditBadge } from "@/components/dashboard/CreditBadge";
import { UserAvatar } from "@/components/dashboard/UserAvatar";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

type NavPath = "dashboard" | "builder";

type Props = {
  isAuthenticated?: boolean;
  activePath?: NavPath;
  creditBalance?: number;
  userName?: string;
};

function navLinkClass(isActive: boolean): string {
  return `text-sm font-medium transition-colors ${
    isActive ? "text-primary" : "text-text-secondary hover:text-text-primary"
  }`;
}

export function Navbar({
  isAuthenticated = false,
  activePath,
  creditBalance,
  userName = "User",
}: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-border-light bg-page/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 md:px-8">
        <div className="flex min-w-0 items-center gap-4 md:gap-8">
          <BrandLogo />

          {isAuthenticated ? (
            <nav className="flex items-center gap-4 md:gap-6" aria-label="Main">
              <Link
                href="/dashboard"
                className={navLinkClass(activePath === "dashboard")}
              >
                Dashboard
              </Link>
              <Link
                href="/builder"
                className={navLinkClass(activePath === "builder")}
              >
                Builder
              </Link>
            </nav>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          <ThemeToggle />

          {isAuthenticated ? (
            <>
              {typeof creditBalance === "number" ? (
                <CreditBadge credits={creditBalance} />
              ) : null}
              <UserAvatar name={userName} />
              <LogoutButton className="text-sm font-semibold text-text-primary transition-opacity hover:opacity-80">
                Sign Out
              </LogoutButton>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-md border border-border-light bg-surface px-4 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-secondary"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
