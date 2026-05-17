import { createFileRoute } from "@tanstack/react-router";
import { WarehousesListPage } from "@/modules/inventory/pages/warehouses-list-page";

export const Route = createFileRoute("/app/inv/warehouses")({
  component: WarehousesListPage,
});
