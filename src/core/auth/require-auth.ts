import { redirect } from "@tanstack/react-router";
import { DEFAULT_AUTH_ROUTE } from "@/config/routes";
import { isAuthenticated } from "@/lib/auth-session";
import { useAuthStore } from "@/stores/auth-store";

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

  const user = useAuthStore.getState().user;
  if (user?.mustChangePassword) {
    throw redirect({ to: "/change-password" });
  }

  if (user?.requiresRoleAssignment) {
    throw redirect({ to: "/access-pending" });
  }
}
