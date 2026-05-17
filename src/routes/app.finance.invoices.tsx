import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/finance/invoices")({
  beforeLoad: () => {
    throw redirect({ to: "/app/invoices" });
  },
});
