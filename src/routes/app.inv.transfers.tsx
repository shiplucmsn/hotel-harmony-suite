import { createFileRoute } from "@tanstack/react-router";
import { TransfersPage } from "@/modules/inventory/pages/transfers-page";

export const Route = createFileRoute("/app/inv/transfers")({
  component: TransfersPage,
});
