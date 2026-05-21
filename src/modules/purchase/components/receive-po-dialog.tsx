import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [batchBySku, setBatchBySku] = useState<Record<string, string>>({});
  const [expiryBySku, setExpiryBySku] = useState<Record<string, string>>({});
  const [updateProductCost, setUpdateProductCost] = useState(false);
  const [requiresQc, setRequiresQc] = useState(false);
  const [headerTax, setHeaderTax] = useState("");
  const [freightCost, setFreightCost] = useState("");
  const [dutyCost, setDutyCost] = useState("");

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
        tax_code: l.tax_code || undefined,
        batch_number: batchBySku[l.sku]?.trim() || undefined,
        expiry_date: expiryBySku[l.sku] || undefined,
      }));
    if (lines.length === 0) return;

    const landed_costs = [];
    const freight = Number(freightCost);
    const duty = Number(dutyCost);
    if (freight > 0) landed_costs.push({ cost_type: "freight" as const, amount: freight, allocation_method: "qty" as const });
    if (duty > 0) landed_costs.push({ cost_type: "duty" as const, amount: duty, allocation_method: "value" as const });

    await createGrn.mutateAsync({
      purchase_order_id: order.id,
      supplier_id: order.supplier_id ?? undefined,
      warehouse_id: order.warehouse_id ?? undefined,
      currency_code: order.currency_code,
      exchange_rate: order.exchange_rate,
      tax_amount: headerTax ? Number(headerTax) : undefined,
      lines,
      landed_costs: landed_costs.length ? landed_costs : undefined,
      update_product_cost: updateProductCost,
      requires_qc: requiresQc,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Receive against {order?.number ?? "PO"}</DialogTitle>
        </DialogHeader>
        {isLoading && <p className="text-sm text-muted-foreground">Loading order…</p>}
        {!isLoading && order && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Supplier: {order.supplier} · Status: {order.status}
              {order.currency_code && order.currency_code !== "USD" && (
                <> · Currency: {order.currency_code} @ {order.exchange_rate ?? 1}</>
              )}
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Ordered</TableHead>
                  <TableHead className="text-right">Received</TableHead>
                  <TableHead className="text-right">Receive now</TableHead>
                  <TableHead>Lot / batch</TableHead>
                  <TableHead>Expiry</TableHead>
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
                      <TableCell>
                        <Input
                          placeholder="Optional"
                          className="w-28 font-mono text-xs"
                          value={batchBySku[line.sku] ?? ""}
                          onChange={(e) =>
                            setBatchBySku((prev) => ({ ...prev, [line.sku]: e.target.value }))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          className="w-36"
                          value={expiryBySku[line.sku] ?? ""}
                          onChange={(e) =>
                            setExpiryBySku((prev) => ({ ...prev, [line.sku]: e.target.value }))
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="space-y-1.5">
                <Label>Freight (base)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0"
                  value={freightCost}
                  onChange={(e) => setFreightCost(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Duty (base)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0"
                  value={dutyCost}
                  onChange={(e) => setDutyCost(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Header tax (base)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0"
                  value={headerTax}
                  onChange={(e) => setHeaderTax(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="requires-qc"
                  checked={requiresQc}
                  onCheckedChange={(v) => setRequiresQc(v === true)}
                />
                <Label htmlFor="requires-qc" className="text-sm font-normal">
                  Send to QC quarantine (stock not sellable until accepted)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="update-product-cost"
                  checked={updateProductCost}
                  onCheckedChange={(v) => setUpdateProductCost(v === true)}
                />
                <Label htmlFor="update-product-cost" className="text-sm font-normal">
                  Update product cost from receipt (when enabled in settings)
                </Label>
              </div>
            </div>
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
