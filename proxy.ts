import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Next 16 renamed the `middleware` file convention to `proxy`. Optimistic
// redirect only — checks the session cookie exists, no DB call (edge-safe).
// The real gate is auth.api.getSession() in app/app/layout.tsx.
export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/new", "/onboarding"],
};
