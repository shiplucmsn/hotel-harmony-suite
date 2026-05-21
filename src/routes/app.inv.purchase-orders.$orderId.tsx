import { createFileRoute } from "@tanstack/react-router";
import { PurchaseOrderDetailPage } from "@/modules/purchase/pages/purchase-order-detail-page";

export const Route = createFileRoute("/app/inv/purchase-orders/$orderId")({
  component: PurchaseOrderDetailPage,
});
