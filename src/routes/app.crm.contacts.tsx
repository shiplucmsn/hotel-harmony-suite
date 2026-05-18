import { createFileRoute } from "@tanstack/react-router";
import { ContactsPage } from "@/modules/crm/pages/contacts-page";

export const Route = createFileRoute("/app/crm/contacts")({
  component: ContactsPage,
});
