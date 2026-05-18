import { createFileRoute } from "@tanstack/react-router";
import { QuotationsPage } from "@/modules/crm/pages/quotations-page";

export const Route = createFileRoute("/app/crm/quotes")({
  component: QuotationsPage,
});
