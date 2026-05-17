import { redirect } from "@tanstack/react-router";
import { DEFAULT_AUTH_ROUTE } from "@/config/routes";
import { isAuthenticated } from "@/lib/auth-session";

export function requireAuth(redirectTo?: string) {
  if (typeof window === "undefined") {
    return;
  }

  if (!isAuthenticated()) {
    throw redirect({
      to: DEFAULT_AUTH_ROUTE,
      search: redirectTo ? { redirect: redirectTo } : undefined,
    });
  }
}
