"use client";

import { useEffect } from "react";

import { identifyUser } from "@/lib/posthog-client";

type Props = {
  children: React.ReactNode;
  userId: string | null;
  userEmail?: string | null;
};

export function PostHogProvider({ children, userId, userEmail }: Props) {
  useEffect(() => {
    if (!userId) {
      return;
    }

    identifyUser(userId, userEmail ? { email: userEmail } : undefined);
  }, [userId, userEmail]);

  return children;
}
