// src/app/utils/routes.ts

/**
 * Check if a pathname is a dashboard route that should show the sidebar
 */
export function isDashboardRoute(pathname: string): boolean {
  const dashboardRoutes = ["/zones/", "/inbox/", "/conversations/"];

  return dashboardRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Extract person ID from dashboard route pathname
 * Returns null if not a valid dashboard route or no person ID found
 */
export function extractPersonIdFromPath(pathname: string): string | null {
  const dashboardRoutePattern = /^\/(zones|inbox|conversations)\/(\d+)/;
  const match = pathname.match(dashboardRoutePattern);

  return match ? match[2] : null;
}

/**
 * Get the current route section (zones, inbox, conversations)
 */
export function getCurrentRouteSection(pathname: string): string | null {
  const dashboardRoutePattern = /^\/(zones|inbox|conversations)\//;
  const match = pathname.match(dashboardRoutePattern);

  return match ? match[1] : null;
}
