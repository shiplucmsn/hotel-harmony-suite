import { useLayoutEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { DEFAULT_APP_ROUTE } from "@/config/routes";
import { getPostAuthRoute } from "@/modules/auth/auth-redirect";
import { isAuthenticated } from "@/lib/auth-session";
import { markAppLoading, markAppReady } from "@/lib/preloader-control";
import { useAuthStore } from "@/stores/auth-store";

/** Blocks login UI until we know the user is not already signed in. */
export function useGuestGate(redirectTo?: string): boolean {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    markAppLoading();

    if (isAuthenticated()) {
      const user = useAuthStore.getState().user;
      const target = user
        ? getPostAuthRoute(user, redirectTo)
        : redirectTo?.startsWith("/app")
          ? redirectTo
          : DEFAULT_APP_ROUTE;
      navigate({ to: target, replace: true });
      return;
    }

    markAppReady();
    setReady(true);
  }, [navigate, redirectTo]);

  return ready;
}
