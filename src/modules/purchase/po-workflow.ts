import type { PurchaseOrderDto } from "@/modules/purchase/types";

export type PoWorkflowActions = {
  canEdit: boolean;
  canSubmit: boolean;
  canApprove: boolean;
  canCancel: boolean;
  canReceive: boolean;
};

export function getPoWorkflow(
  order: Pick<PurchaseOrderDto, "status"> & { lines?: { quantity_ordered?: number; quantity_received?: number }[] },
): PoWorkflowActions {
  const status = order.status;
  const hasRemaining =
    (order.lines ?? []).some(
      (l) => (l.quantity_ordered ?? 0) - (l.quantity_received ?? 0) > 0.0001,
    ) ?? false;

  return {
    canEdit: status === "draft",
    canSubmit: status === "draft",
    canApprove: status === "pending_approval",
    canCancel: !["received", "cancelled"].includes(status),
    canReceive: ["pending", "partial"].includes(status) && hasRemaining,
  };
}

export function poStatusLabel(status: string): string {
  switch (status) {
    case "pending_approval":
      return "Awaiting approval";
    case "partial":
      return "Partially received";
    default:
      return status.replace(/_/g, " ");
  }
}
