"use client";

import { resetUser } from "@/lib/posthog-client";

type Props = {
  className?: string;
  children: React.ReactNode;
};

export function LogoutButton({ className, children }: Props) {
  return (
    <form
      action="/api/auth/logout"
      method="post"
      onSubmit={() => {
        resetUser();
      }}
    >
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}
