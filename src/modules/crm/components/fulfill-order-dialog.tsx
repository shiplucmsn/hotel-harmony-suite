import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { useFulfillOrder } from "@/hooks/crm/use-crm";
import { useInventoryWarehouses } from "@/hooks/inventory/use-inventory-warehouses";
import type { CrmOrderDto } from "@/modules/crm/types";

type FulfillOrderDialogProps = {
  order: CrmOrderDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function FulfillOrderDialog({ order, open, onOpenChange }: FulfillOrderDialogProps) {
  const { data: warehousesData } = useInventoryWarehouses();
  const warehouses = warehousesData?.data ?? [];
  const fulfillOrder = useFulfillOrder();

  const presetWarehouseId = order?.warehouse_id ?? order?.warehouse?.id;
  const [overrideWarehouse, setOverrideWarehouse] = useState(false);
  const [warehouseId, setWarehouseId] = useState("");

  useEffect(() => {
    if (!open) {
      setOverrideWarehouse(false);
      setWarehouseId("");
      return;
    }
    if (presetWarehouseId) {
      setWarehouseId(String(presetWarehouseId));
    } else {
      const def = warehouses.find((w) => w.is_default) ?? warehouses[0];
      if (def) {
        setWarehouseId(String(def.id));
      }
    }
  }, [open, presetWarehouseId, warehouses]);

  const needsPicker = !presetWarehouseId || overrideWarehouse;
  const warehouseIdNum = warehouseId ? Number(warehouseId) : 0;

  const handleFulfill = async () => {
    if (!order) {
      return;
    }
    const body =
      needsPicker && warehouseIdNum > 0
        ? { id: order.id, warehouse_id: warehouseIdNum }
        : { id: order.id };
    await fulfillOrder.mutateAsync(body);
    onOpenChange(false);
  };

  const presetName =
    order?.warehouse?.name ??
    warehouses.find((w) => w.id === presetWarehouseId)?.name ??
    null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Fulfill order — stock out</DialogTitle>
          <DialogDescription>
            Deduct inventory and post COGS for order{" "}
            <span className="font-medium text-foreground">{order?.number}</span>.
          </DialogDescription>
        </DialogHeader>

        {presetWarehouseId && presetName && !overrideWarehouse ? (
          <p className="text-sm text-muted-foreground">
            Ship-from: <span className="font-medium text-foreground">{presetName}</span>
          </p>
        ) : null}

        {presetWarehouseId ? (
          <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
            <Label htmlFor="fulfill-override" className="text-sm font-normal">
              Ship from a different warehouse
            </Label>
            <Switch
              id="fulfill-override"
              checked={overrideWarehouse}
              onCheckedChange={setOverrideWarehouse}
            />
          </div>
        ) : null}

        {needsPicker && warehouses.length > 0 ? (
          <div className="space-y-2">
            <Label htmlFor="fulfill-wh">Warehouse</Label>
            <Select value={warehouseId} onValueChange={setWarehouseId}>
              <SelectTrigger id="fulfill-wh">
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
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={fulfillOrder.isPending || (needsPicker && warehouseIdNum <= 0)}
            onClick={() => void handleFulfill()}
          >
            {fulfillOrder.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fulfilling…
              </>
            ) : (
              "Fulfill order"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
