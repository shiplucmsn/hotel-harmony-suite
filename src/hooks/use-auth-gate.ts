import { useLayoutEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { DEFAULT_AUTH_ROUTE } from "@/config/routes";
import { isAuthenticated } from "@/lib/auth-session";
import { markAppLoading, markAppReady } from "@/lib/preloader-control";

/**
 * Blocks protected UI until the browser confirms a session exists.
 * Starts as false on server and first client paint to match SSR (no dashboard flash).
 */
export function useAuthGate(redirectTo?: string): boolean {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(false);

  useLayoutEffect(() => {
    markAppLoading();

    if (isAuthenticated()) {
      markAppReady();
      setAllowed(true);
      return;
    }

    navigate({
      to: DEFAULT_AUTH_ROUTE,
      search: redirectTo ? { redirect: redirectTo } : undefined,
      replace: true,
    });
  }, [navigate, redirectTo]);

  return allowed;
}
