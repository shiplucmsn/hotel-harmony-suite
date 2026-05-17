import { createFileRoute } from "@tanstack/react-router";
import { BillingPage } from "@/modules/pos/pages/billing-page";

export const Route = createFileRoute("/app/pos/billing")({
  component: BillingPage,
});
