import { createFileRoute } from "@tanstack/react-router";
import { CustomersPage } from "@/modules/crm/pages/customers-page";

export const Route = createFileRoute("/app/crm/customers")({
  component: CustomersPage,
});
