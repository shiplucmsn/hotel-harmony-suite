import { useLayoutEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { DEFAULT_AUTH_ROUTE } from "@/config/routes";
import { isAuthenticated } from "@/lib/auth-session";

/**
 * Client-side complement to requireAuth() for SSR/full page loads.
 */
export function useRequireAuthRedirect(redirectTo?: string) {
  const navigate = useNavigate();

  useLayoutEffect(() => {
    if (isAuthenticated()) {
      return;
    }

    navigate({
      to: DEFAULT_AUTH_ROUTE,
      search: redirectTo ? { redirect: redirectTo } : undefined,
      replace: true,
    });
  }, [navigate, redirectTo]);
}
