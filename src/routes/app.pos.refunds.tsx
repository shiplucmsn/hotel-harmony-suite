import { createFileRoute } from "@tanstack/react-router";
import { RefundsPage } from "@/modules/pos/pages/refunds-page";

export const Route = createFileRoute("/app/pos/refunds")({
  component: RefundsPage,
});
