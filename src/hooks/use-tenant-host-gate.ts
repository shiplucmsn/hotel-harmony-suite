import { useLayoutEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { bootstrapTenantFromHostAsync, type TenantHostStatus } from "@/lib/tenant-resolve";
import { markAppLoading, markAppReady } from "@/lib/preloader-control";

type TenantHostGateOptions = {
  /** When true, apex hosts cannot access the route (e.g. /app). */
  requireWorkspace?: boolean;
};

/**
 * Resolves workspace from hostname via API before showing the route.
 */
export function useTenantHostGate(options: TenantHostGateOptions = {}): boolean {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    markAppLoading();
    let cancelled = false;

    void bootstrapTenantFromHostAsync().then((status: TenantHostStatus) => {
      if (cancelled) return;

      if (status === "not_found") {
        navigate({ to: "/workspace-not-found", replace: true });
        return;
      }

      if (options.requireWorkspace && status === "apex") {
        navigate({ to: "/signup", replace: true });
        return;
      }

      markAppReady();
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [navigate, options.requireWorkspace]);

  return ready;
}
