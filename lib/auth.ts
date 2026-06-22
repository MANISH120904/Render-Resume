import { redirect } from "next/navigation";

import { createInsforgeServer } from "@/lib/insforge-server";

const DEFAULT_AUTH_REDIRECT = "/dashboard";

export function getSafeRedirectPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return DEFAULT_AUTH_REDIRECT;
  }

  return next;
}

export async function getCurrentUser() {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.auth.getCurrentUser();

  if (error || !data.user) {
    return null;
  }

  return data.user;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
