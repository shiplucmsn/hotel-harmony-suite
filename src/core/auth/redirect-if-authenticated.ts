import { redirect } from "@tanstack/react-router";
import { DEFAULT_APP_ROUTE } from "@/config/routes";
import { isAuthenticated } from "@/lib/auth-session";

/**
 * Client-only guard for route beforeLoad (SSR has no localStorage).
 * Pair with useGuestOnlyRedirect in the route component for full page loads.
 */
export function redirectIfAuthenticated(fallbackRoute: string = DEFAULT_APP_ROUTE) {
  if (typeof window === "undefined") {
    return;
  }

  if (!isAuthenticated()) {
    return;
  }

  const target = fallbackRoute.startsWith("/app") ? fallbackRoute : DEFAULT_APP_ROUTE;

  throw redirect({ to: target });
}
