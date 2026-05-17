import { createFileRoute } from "@tanstack/react-router";
import { OrdersPage } from "@/modules/crm/pages/orders-page";

export const Route = createFileRoute("/app/crm/orders")({
  component: OrdersPage,
});
