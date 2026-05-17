import { createFileRoute } from "@tanstack/react-router";
import { WarehouseDashboardPage } from "@/modules/inventory/pages/warehouse-dashboard-page";

export const Route = createFileRoute("/app/inv/warehouses-dashboard")({
  component: WarehouseDashboardPage,
});
