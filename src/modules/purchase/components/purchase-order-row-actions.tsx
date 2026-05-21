import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useApprovePurchaseOrder,
  useCancelPurchaseOrder,
  useSubmitPurchaseOrder,
} from "@/hooks/purchase/use-purchase";
import { getPoWorkflow } from "@/modules/purchase/po-workflow";
import type { PurchaseOrderDto } from "@/modules/purchase/types";

type ConfirmAction = "submit" | "approve" | "cancel" | null;

type PurchaseOrderRowActionsProps = {
  order: PurchaseOrderDto;
  onEdit: (order: PurchaseOrderDto) => void;
};

export function PurchaseOrderRowActions({ order, onEdit }: PurchaseOrderRowActionsProps) {
  const navigate = useNavigate();
  const workflow = getPoWorkflow(order);
  const submit = useSubmitPurchaseOrder();
  const approve = useApprovePurchaseOrder();
  const cancel = useCancelPurchaseOrder();
  const [confirm, setConfirm] = useState<ConfirmAction>(null);

  const runConfirm = async () => {
    if (confirm === "submit") {
      await submit.mutateAsync({ id: order.id });
    } else if (confirm === "approve") {
      await approve.mutateAsync(order.id);
    } else if (confirm === "cancel") {
      await cancel.mutateAsync(order.id);
    }
    setConfirm(null);
  };

  const confirmCopy =
    confirm === "submit"
      ? {
          title: "Submit purchase order?",
          description: `PO ${order.number} will be sent for processing${order.status === "draft" ? " (approval may be required)." : "."}`,
        }
      : confirm === "approve"
        ? {
            title: "Approve purchase order?",
            description: `Approve ${order.number} so goods can be received against this PO.`,
          }
        : confirm === "cancel"
          ? {
              title: "Cancel purchase order?",
              description: `Cancel ${order.number}. This cannot be undone if receipts exist.`,
            }
          : { title: "", description: "" };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="PO actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={() =>
              void navigate({
                to: "/app/inv/purchase-orders/$orderId",
                params: { orderId: String(order.id) },
              })
            }
          >
            View details
          </DropdownMenuItem>
          {workflow.canEdit && (
            <DropdownMenuItem onClick={() => onEdit(order)}>Edit draft</DropdownMenuItem>
          )}
          {workflow.canSubmit && (
            <DropdownMenuItem onClick={() => setConfirm("submit")}>Submit PO</DropdownMenuItem>
          )}
          {workflow.canApprove && (
            <DropdownMenuItem onClick={() => setConfirm("approve")}>Approve PO</DropdownMenuItem>
          )}
          {workflow.canReceive && (
            <DropdownMenuItem asChild>
              <Link to="/app/inv/purchase-orders/$orderId" params={{ orderId: String(order.id) }}>
                Receive goods
              </Link>
            </DropdownMenuItem>
          )}
          {order.supplier_id && (
            <DropdownMenuItem asChild>
              <Link to="/app/inv/supplier-ledger" search={{ supplier_id: order.supplier_id }}>
                Supplier ledger
              </Link>
            </DropdownMenuItem>
          )}
          {workflow.canCancel && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => setConfirm("cancel")}>
                Cancel PO
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirm != null} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmCopy.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmCopy.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction onClick={() => void runConfirm()}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
