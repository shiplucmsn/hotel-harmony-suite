import { createFileRoute, redirect } from "@tanstack/react-router";
import { requireAuth } from "@/core/auth/require-auth";
import { requireRoutePermission } from "@/core/auth/require-permission";
import { AppShell } from "@/shared/layouts/app-shell";
import { getTenantId } from "@/lib/api-auth";
import { bootstrapTenantFromHostAsync, buildWorkspaceUrl } from "@/lib/tenant-resolve";
import { enforceWorkspaceHostForUser } from "@/lib/workspace-host-guard";
import { isAuthenticated } from "@/lib/auth-session";
import { useAuthStore } from "@/stores/auth-store";

export const Route = createFileRoute("/app")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    requireAuth(location.href);

    const hostStatus = await bootstrapTenantFromHostAsync();
    if (hostStatus === "not_found") {
      throw redirect({ to: "/workspace-not-found" });
    }
    if (hostStatus === "apex") {
      const tenantId = useAuthStore.getState().user?.tenantId ?? getTenantId();
      if (isAuthenticated() && tenantId) {
        window.location.replace(buildWorkspaceUrl(tenantId, location.pathname));
        return;
      }
      throw redirect({ to: "/signup" });
    }

    if (!enforceWorkspaceHostForUser()) {
      return;
    }

    requireRoutePermission(location.pathname);
  },
  component: AppShell,
});
