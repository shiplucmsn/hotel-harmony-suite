import { createFileRoute } from "@tanstack/react-router";
import { GrnDetailPage } from "@/modules/purchase/pages/grn-detail-page";

export const Route = createFileRoute("/app/inv/grn/$grnId")({
  component: GrnDetailPage,
});
