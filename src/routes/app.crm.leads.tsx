import { createFileRoute } from "@tanstack/react-router";
import { LeadsPage } from "@/modules/crm/pages/leads-page";

export const Route = createFileRoute("/app/crm/leads")({
  component: LeadsPage,
});
