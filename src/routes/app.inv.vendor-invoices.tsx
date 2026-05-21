import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/app/inv/vendor-invoices")({
  component: () => <Outlet />,
});
