import { createFileRoute } from "@tanstack/react-router";
import { LedgerPage } from "@/modules/crm/pages/ledger-page";

export const Route = createFileRoute("/app/crm/ledger")({
  component: LedgerPage,
});
