import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useConfirmOrder, useOrderStockAvailability } from "@/hooks/crm/use-crm";
import { useInventoryWarehouses } from "@/hooks/inventory/use-inventory-warehouses";
import type { CrmOrderDto } from "@/modules/crm/types";

type ConfirmOrderDialogProps = {
  order: CrmOrderDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ConfirmOrderDialog({ order, open, onOpenChange }: ConfirmOrderDialogProps) {
  const { data: warehousesData } = useInventoryWarehouses();
  const warehouses = warehousesData?.data ?? [];
  const defaultWarehouse = warehouses.find((w) => w.is_default) ?? warehouses[0];
  const [warehouseId, setWarehouseId] = useState("");

  useEffect(() => {
    if (!open) {
      setWarehouseId("");
      return;
    }
    if (defaultWarehouse) {
      setWarehouseId(String(defaultWarehouse.id));
    }
  }, [open, defaultWarehouse?.id]);

  const warehouseIdNum = warehouseId ? Number(warehouseId) : 0;
  const { data: availability, isLoading: availabilityLoading } = useOrderStockAvailability(
    order?.id,
    warehouseIdNum,
    open && Boolean(order) && warehouseIdNum > 0,
  );

  const confirmOrder = useConfirmOrder();

  const trackedLines = availability?.lines.filter((l) => l.track_inventory) ?? [];
  const allSufficient = useMemo(() => {
    if (trackedLines.length === 0) {
      return true;
    }
    return trackedLines.every((l) => l.sufficient);
  }, [trackedLines]);

  const handleConfirm = async () => {
    if (!order || warehouseIdNum <= 0) {
      return;
    }
    await confirmOrder.mutateAsync({ id: order.id, warehouse_id: warehouseIdNum });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Confirm order — reserve stock</DialogTitle>
          <DialogDescription>
            Choose the warehouse to ship from. Stock will be reserved at this location for order{" "}
            <span className="font-medium text-foreground">{order?.number}</span>.
          </DialogDescription>
        </DialogHeader>

        {warehouses.length > 1 ? (
          <div className="space-y-2">
            <Label htmlFor="confirm-wh">Ship-from warehouse</Label>
            <Select value={warehouseId} onValueChange={setWarehouseId}>
              <SelectTrigger id="confirm-wh">
                <SelectValue placeholder="Select warehouse" />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map((w) => (
                  <SelectItem key={w.id} value={String(w.id)}>
                    {w.name}
                    {w.is_default ? " (default)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : defaultWarehouse ? (
          <p className="text-sm text-muted-foreground">
            Ship-from: <span className="font-medium text-foreground">{defaultWarehouse.name}</span>
          </p>
        ) : null}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Ordered</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead className="w-20 text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {availabilityLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                    <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : availability?.lines.length ? (
                availability.lines.map((line) => (
                  <TableRow key={line.sku}>
                    <TableCell className="font-mono text-xs">{line.sku}</TableCell>
                    <TableCell className="text-right tabular-nums">{line.quantity_needed}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {line.track_inventory ? line.available_qty : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {!line.track_inventory ? (
                        <Badge variant="secondary">N/A</Badge>
                      ) : line.sufficient ? (
                        <Badge variant="outline" className="border-success/40 text-success">
                          OK
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Short</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="py-4 text-center text-sm text-muted-foreground">
                    No inventory lines to check.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {!allSufficient && !availabilityLoading ? (
          <p className="text-sm text-destructive">
            Not enough available stock at this warehouse. Choose another warehouse or reduce quantities.
          </p>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={
              confirmOrder.isPending ||
              warehouseIdNum <= 0 ||
              availabilityLoading ||
              !allSufficient
            }
            onClick={() => void handleConfirm()}
          >
            {confirmOrder.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Confirming…
              </>
            ) : (
              "Confirm & reserve"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
