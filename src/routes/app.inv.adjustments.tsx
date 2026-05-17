import { createFileRoute } from "@tanstack/react-router";
import { AdjustmentsPage } from "@/modules/inventory/pages/adjustments-page";

export const Route = createFileRoute("/app/inv/adjustments")({
  component: AdjustmentsPage,
});
