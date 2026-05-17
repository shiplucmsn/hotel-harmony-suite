import { useLayoutEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { DEFAULT_APP_ROUTE } from "@/config/routes";
import { isAuthenticated } from "@/lib/auth-session";

/**
 * Redirects authenticated users away from guest routes (login, register).
 * Required because route beforeLoad runs on SSR without access to localStorage.
 */
export function useGuestOnlyRedirect(redirectTo?: string) {
  const navigate = useNavigate();

  useLayoutEffect(() => {
    if (!isAuthenticated()) {
      return;
    }

    const target = redirectTo?.startsWith("/app") ? redirectTo : DEFAULT_APP_ROUTE;
    navigate({ to: target, replace: true });
  }, [navigate, redirectTo]);
}
