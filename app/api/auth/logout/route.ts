import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookies, createServerClient } from "@insforge/sdk/ssr";

async function logout(request: NextRequest): Promise<NextResponse> {
  try {
    const insforge = createServerClient({
      cookies: request.cookies,
    });

    await insforge.auth.signOut();
  } catch (error) {
    console.error("[auth/logout]", error);
  }

  const response = NextResponse.redirect(new URL("/login", request.url));
  clearAuthCookies(response.cookies);

  return response;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  return logout(request);
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
