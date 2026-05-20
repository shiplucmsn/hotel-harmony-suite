import { createFileRoute } from "@tanstack/react-router";
import { LowStockPage } from "@/modules/inventory/pages/low-stock-page";

export const Route = createFileRoute("/app/inv/low-stock")({
  component: LowStockPage,
});
