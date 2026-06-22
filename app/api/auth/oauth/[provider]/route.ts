import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@insforge/sdk/ssr";

import { getSafeRedirectPath } from "@/lib/auth";

const allowedProviders = new Set(["google", "github"]);
const verifierCookieName = "render_resume_oauth_code_verifier";
const nextCookieName = "render_resume_auth_next";

type RouteContext = {
  params: Promise<{
    provider: string;
  }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const loginUrl = new URL("/login", request.url);

  try {
    const { provider } = await context.params;
    const normalizedProvider = provider.toLowerCase();

    if (!allowedProviders.has(normalizedProvider)) {
      loginUrl.searchParams.set("error", "provider");
      return NextResponse.redirect(loginUrl);
    }

    const callbackUrl = new URL("/callback", request.nextUrl.origin);
    const insforge = createServerClient();
    const { data, error } = await insforge.auth.signInWithOAuth(
      normalizedProvider,
      {
        redirectTo: callbackUrl.toString(),
        skipBrowserRedirect: true,
      },
    );

    if (error || !data.url || !data.codeVerifier) {
      console.error("[auth/oauth]", error);
      loginUrl.searchParams.set("error", "oauth");
      return NextResponse.redirect(loginUrl);
    }

    const response = NextResponse.redirect(data.url);
    response.cookies.set(verifierCookieName, data.codeVerifier, {
      httpOnly: true,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
      path: "/",
      maxAge: 60 * 10,
    });

    const next = request.nextUrl.searchParams.get("next");
    if (next) {
      response.cookies.set(nextCookieName, getSafeRedirectPath(next), {
        httpOnly: true,
        sameSite: "lax",
        secure: request.nextUrl.protocol === "https:",
        path: "/",
        maxAge: 60 * 10,
      });
    }

    return response;
  } catch (error) {
    console.error("[auth/oauth]", error);
    loginUrl.searchParams.set("error", "oauth");
    return NextResponse.redirect(loginUrl);
  }
}
