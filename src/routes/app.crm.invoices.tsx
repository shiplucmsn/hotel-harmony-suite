import { createFileRoute } from "@tanstack/react-router";
import { InvoicesPage } from "@/modules/crm/pages/invoices-page";

export const Route = createFileRoute("/app/crm/invoices")({
  component: InvoicesPage,
});
