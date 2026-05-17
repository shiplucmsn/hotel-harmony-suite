import { createFileRoute } from "@tanstack/react-router";
import { PaymentsPage } from "@/modules/crm/pages/payments-page";

export const Route = createFileRoute("/app/crm/payments")({
  component: PaymentsPage,
});
