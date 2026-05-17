import { useLayoutEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { AUTH_ROUTES, APP_PREFIX } from "@/config/routes";
import { markAppReady } from "@/lib/preloader-control";

/** Hides the global preloader on public routes that do not run auth gates. */
export function usePreloaderController() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useLayoutEffect(() => {
    const isApp = pathname.startsWith(APP_PREFIX);
    const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

    if (!isApp && !isAuthRoute) {
      markAppReady();
    }
  }, [pathname]);
}
