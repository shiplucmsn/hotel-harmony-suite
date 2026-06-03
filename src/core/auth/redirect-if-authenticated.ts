import { redirect } from "@tanstack/react-router";
import { DEFAULT_APP_ROUTE } from "@/config/routes";
import { getPostAuthRoute } from "@/modules/auth/auth-redirect";
import { isAuthenticated } from "@/lib/auth-session";
import { useAuthStore } from "@/stores/auth-store";

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

  const user = useAuthStore.getState().user;
  const target = user ? getPostAuthRoute(user, fallbackRoute) : DEFAULT_APP_ROUTE;

  throw redirect({ to: target });
}
