import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/core/auth/require-auth";
import { AppShell } from "@/shared/layouts/app-shell";

export const Route = createFileRoute("/app")({
  ssr: false,
  beforeLoad: ({ location }) => {
    requireAuth(location.href);
  },
  component: AppShell,
});
