import { redirect } from "next/navigation";

import { LoginCard } from "@/components/auth/LoginCard";
import { getCurrentUser, getSafeRedirectPath } from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string | string[];
    next?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = Array.isArray(params.next) ? params.next[0] : params.next;
  const user = await getCurrentUser();

  if (user) {
    redirect(getSafeRedirectPath(next));
  }

  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  return <LoginCard error={error} next={next} />;
}
