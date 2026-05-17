import { createFileRoute } from "@tanstack/react-router";
import { StockMovementsPage } from "@/modules/inventory/pages/stock-movements-page";

export const Route = createFileRoute("/app/inv/movements")({
  component: StockMovementsPage,
});
