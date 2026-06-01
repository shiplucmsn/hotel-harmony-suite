import { createFileRoute } from "@tanstack/react-router";
import { requirePermission } from "@/core/auth/require-permission";
import { GrnQcQueuePage } from "@/modules/purchase/pages/grn-qc-queue-page";

export const Route = createFileRoute("/app/inv/grn-qc")({
  beforeLoad: () => requirePermission("purchase.grn.qc.view"),
  component: GrnQcQueuePage,
});
