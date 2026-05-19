import { createFileRoute } from "@tanstack/react-router";
import { TicketsPage } from "@/modules/crm/pages/tickets-page";

export const Route = createFileRoute("/app/crm/tickets")({
  component: TicketsPage,
});
