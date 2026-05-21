import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCreateGrn, usePurchaseOrder } from "@/hooks/purchase/use-purchase";
import type { PurchaseOrderLineDto } from "@/modules/purchase/types";

type ReceivePoDialogProps = {
  orderId: number | string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function remainingQty(line: PurchaseOrderLineDto): number {
  const ordered = line.quantity_ordered ?? 0;
  const received = line.quantity_received ?? 0;
  return Math.max(0, ordered - received);
}

export function ReceivePoDialog({ orderId, open, onOpenChange }: ReceivePoDialogProps) {
  const { data: order, isLoading } = usePurchaseOrder(open ? orderId : null);
  const createGrn = useCreateGrn();
  const [qtyBySku, setQtyBySku] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!order?.lines) return;
    const next: Record<string, number> = {};
    for (const line of order.lines) {
      const rem = remainingQty(line);
      if (rem > 0 && line.sku) next[line.sku] = rem;
    }
    setQtyBySku(next);
  }, [order]);

  const submit = async () => {
    if (!order) return;
    const lines = (order.lines ?? [])
      .filter((l) => l.sku && (qtyBySku[l.sku] ?? 0) > 0)
      .map((l) => ({
        sku: l.sku,
        quantity: qtyBySku[l.sku] ?? 0,
        unit_cost: l.unit_cost,
      }));
    if (lines.length === 0) return;

    await createGrn.mutateAsync({
      purchase_order_id: order.id,
      supplier_id: order.supplier_id ?? undefined,
      warehouse_id: order.warehouse_id ?? undefined,
      lines,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Receive against {order?.number ?? "PO"}</DialogTitle>
        </DialogHeader>
        {isLoading && <p className="text-sm text-muted-foreground">Loading order…</p>}
        {!isLoading && order && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Supplier: {order.supplier} · Status: {order.status}
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Ordered</TableHead>
                  <TableHead className="text-right">Received</TableHead>
                  <TableHead className="text-right">Receive now</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(order.lines ?? []).map((line) => {
                  const rem = remainingQty(line);
                  if (rem <= 0) return null;
                  return (
                    <TableRow key={line.sku}>
                      <TableCell className="font-mono text-xs">{line.sku}</TableCell>
                      <TableCell className="text-right">{line.quantity_ordered}</TableCell>
                      <TableCell className="text-right">{line.quantity_received}</TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          min={0}
                          max={rem}
                          step="any"
                          className="ml-auto w-24"
                          value={qtyBySku[line.sku] ?? rem}
                          onChange={(e) =>
                            setQtyBySku((prev) => ({
                              ...prev,
                              [line.sku]: Math.min(rem, Number(e.target.value)),
                            }))
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={createGrn.isPending || !order} onClick={() => void submit()}>
            {createGrn.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Post GRN
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
