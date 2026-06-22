import Link from "next/link";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

type Props = {
  isAuthenticated?: boolean;
};

export function Navbar({ isAuthenticated = false }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-border-light bg-page/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 md:px-8">
        <BrandLogo />

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center justify-center rounded-md border border-border-light bg-surface px-4 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-secondary"
              >
                Dashboard
              </Link>
              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-text-inverse shadow-md transition-colors hover:bg-primary-hover"
                >
                  Sign Out
                </button>
              </form>
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
