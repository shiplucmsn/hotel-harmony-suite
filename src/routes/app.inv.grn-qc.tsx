import { createFileRoute } from "@tanstack/react-router";
import { GrnQcQueuePage } from "@/modules/purchase/pages/grn-qc-queue-page";

export const Route = createFileRoute("/app/inv/grn-qc")({
  component: GrnQcQueuePage,
});
