import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/crm/invoices")({
  beforeLoad: () => {
    throw redirect({ to: "/app/invoices" });
  },
});
