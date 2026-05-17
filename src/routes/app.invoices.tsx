import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/invoices")({
  beforeLoad: () => {
    throw redirect({ to: "/app/crm/invoices" });
  },
});
