// middleware.ts (in project root) - HYDRATION-SAFE VERSION
import { SessionData } from "@/app/types/ouath/session";
import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "mymmo-session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /zones/[personId] routes and other dashboard routes
  const zonesMatch = pathname.match(/^\/zones\/(\d+)/);
  const inboxMatch = pathname.match(/^\/inbox\/(\d+)/);
  const conversationsMatch = pathname.match(/^\/conversations\/(\d+)/);

  if (!zonesMatch && !inboxMatch && !conversationsMatch) {
    return NextResponse.next();
  }

  const requestedPersonId =
    zonesMatch?.[1] || inboxMatch?.[1] || conversationsMatch?.[1];
  const sessionCookie = request.cookies.get(COOKIE_NAME);

  // No session - redirect to login
  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    console.log(
      `[MIDDLEWARE] No session found, redirecting to login from ${pathname}`
    );
    return NextResponse.redirect(loginUrl);
  }

  try {
    const sessionData: SessionData = JSON.parse(sessionCookie.value);

    // Check if session is expired
    if (Date.now() > sessionData.expiresAt) {
      console.log(
        `[MIDDLEWARE] Session expired for person ${sessionData.personId}`
      );
      const loginUrl = new URL("/login", request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(COOKIE_NAME);
      return response;
    }

    // Check if user is trying to access a different person's data
    if (sessionData.personId !== requestedPersonId) {
      console.log(
        `[MIDDLEWARE] Person ${sessionData.personId} tried to access ${requestedPersonId}'s data`
      );

      // Redirect to their own zones page with session data
      const authorizedUrl = new URL(
        `/zones/${sessionData.personId}`,
        request.url
      );

      // Preserve query parameters from session
      authorizedUrl.searchParams.set("appLang", sessionData.appLang);
      authorizedUrl.searchParams.set(
        "translationLang",
        sessionData.translationLang
      );

      return NextResponse.redirect(authorizedUrl);
    }

    // Valid session and authorized access - add session info to headers for client
    const response = NextResponse.next();

    // Add session info to response headers (optional, for debugging)
    response.headers.set("x-session-person-id", sessionData.personId);
    response.headers.set("x-session-valid", "true");

    return response;
  } catch (error) {
    console.error("[MIDDLEWARE] Session validation error:", error);
    const loginUrl = new URL("/login", request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - / (root page)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login|$).*)",
  ],
};
