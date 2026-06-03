import { useEffect } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useTenantContext } from "@/hooks/use-tenant-context";

const ALLOWED_PREFIXES = ["/app/subscription", "/app/settings"];

/** Redirects to billing when trial ended or subscription is suspended. */
export function useRestrictedSubscriptionGate(enabled: boolean): void {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: ctx } = useTenantContext();

  useEffect(() => {
    if (!enabled || !ctx?.is_restricted) {
      return;
    }

    const allowed = ALLOWED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
    if (!allowed) {
      navigate({ to: "/app/subscription", replace: true });
    }
  }, [enabled, ctx?.is_restricted, pathname, navigate]);
}
