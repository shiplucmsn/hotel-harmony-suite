import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/core/auth/require-auth";
import { requireRoutePermission } from "@/core/auth/require-permission";
import { AppShell } from "@/shared/layouts/app-shell";

export const Route = createFileRoute("/app")({
  ssr: false,
  beforeLoad: ({ location }) => {
    requireAuth(location.href);
    requireRoutePermission(location.pathname);
  },
  component: AppShell,
});
