import { NextRequest, NextResponse } from "next/server";
import {
  clearAuthCookies,
  createServerClient,
  setAuthCookies,
} from "@insforge/sdk/ssr";

import { getSafeRedirectPath } from "@/lib/auth";

const verifierCookieName = "render_resume_oauth_code_verifier";
const nextCookieName = "render_resume_auth_next";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const loginUrl = new URL("/login", request.url);

  try {
    const callbackError = request.nextUrl.searchParams.get("error");
    const code = request.nextUrl.searchParams.get("insforge_code");
    const codeVerifier = request.cookies.get(verifierCookieName)?.value;

    if (callbackError || !code || !codeVerifier) {
      loginUrl.searchParams.set("error", "callback");
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(verifierCookieName);
      clearAuthCookies(response.cookies);
      return response;
    }

    const insforge = createServerClient();
    const { data, error } = await insforge.auth.exchangeOAuthCode(
      code,
      codeVerifier,
    );

    if (error || !data?.accessToken || !data.user) {
      console.error("[auth/callback]", error);
      loginUrl.searchParams.set("error", "callback");
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(verifierCookieName);
      clearAuthCookies(response.cookies);
      return response;
    }

    const redirectPath = getSafeRedirectPath(
      request.cookies.get(nextCookieName)?.value,
    );
    const response = NextResponse.redirect(new URL(redirectPath, request.url));
    response.cookies.delete(verifierCookieName);
    response.cookies.delete(nextCookieName);
    setAuthCookies(response.cookies, {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });

    return response;
  } catch (error) {
    console.error("[auth/callback]", error);
    loginUrl.searchParams.set("error", "callback");
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(verifierCookieName);
    clearAuthCookies(response.cookies);
    return response;
  }
}
