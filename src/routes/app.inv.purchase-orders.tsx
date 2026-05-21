import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/app/inv/purchase-orders")({
  component: () => <Outlet />,
});
