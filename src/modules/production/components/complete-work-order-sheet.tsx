import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCompleteProductionWorkOrder, useProductionWorkOrder } from "@/hooks/production/use-production";
import type { ProductionWorkOrderDto } from "@/modules/production/types";

type CompleteWorkOrderSheetProps = {
  workOrderId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary?: ProductionWorkOrderDto | null;
};

export function CompleteWorkOrderSheet({
  workOrderId,
  open,
  onOpenChange,
  summary,
}: CompleteWorkOrderSheetProps) {
  const { data: detail, isLoading } = useProductionWorkOrder(open ? workOrderId : null);
  const completeWorkOrder = useCompleteProductionWorkOrder();
  const wo = detail ?? summary;

  const plannedQty = wo?.planned_qty ?? 0;
  const [actualFinishQty, setActualFinishQty] = useState(String(plannedQty));
  const [overhead, setOverhead] = useState("0");

  useEffect(() => {
    if (!open || !wo) return;
    setActualFinishQty(String(wo.planned_qty));
    setOverhead("0");
  }, [open, wo?.id, wo?.planned_qty]);

  const actualNum = Number(actualFinishQty);
  const ratio = plannedQty > 0 ? actualNum / plannedQty : 0;
  const isPartial = plannedQty > 0 && actualNum > 0 && actualNum < plannedQty;
  const shortfall = plannedQty - actualNum;

  const producedGoods = useMemo(() => {
    if (!wo?.outputs?.length || actualNum <= 0) return undefined;

    return wo.outputs.map((line) => ({
      line_id: line.id,
      actual_qty: Number((line.planned_qty * ratio).toFixed(3)),
    }));
  }, [wo?.outputs, actualNum, ratio]);

  const canSubmit = actualNum > 0 && actualNum <= plannedQty * 1.05;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Complete work order</SheetTitle>
          <SheetDescription className="font-mono">{wo?.number}</SheetDescription>
        </SheetHeader>

        {isLoading && !detail ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="actual-finish-qty">Finished quantity produced</Label>
              <Input
                id="actual-finish-qty"
                type="number"
                min={0.001}
                step="0.001"
                max={plannedQty}
                value={actualFinishQty}
                onChange={(e) => setActualFinishQty(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Planned: {plannedQty} · Enter less if scrap/reject (e.g. 19 of 20).
              </p>
            </div>

            {isPartial && (
              <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
                <p>
                  <strong>{shortfall}</strong> unit{shortfall === 1 ? "" : "s"} not produced on this
                  order. Raw materials will be consumed for <strong>{actualNum}</strong> only (
                  {Math.round(ratio * 100)}% of plan). Create another work order for the remainder if
                  needed.
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="overhead-cost">Overhead cost (optional)</Label>
              <Input
                id="overhead-cost"
                type="number"
                min={0}
                step="0.01"
                value={overhead}
                onChange={(e) => setOverhead(e.target.value)}
              />
            </div>
          </div>
        )}

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!canSubmit || completeWorkOrder.isPending || !workOrderId}
            onClick={() => {
              if (!workOrderId || !producedGoods) return;
              completeWorkOrder.mutate(
                {
                  id: workOrderId,
                  body: {
                    overhead_cost: Number(overhead || 0),
                    produced_goods: producedGoods,
                  },
                },
                { onSuccess: () => onOpenChange(false) },
              );
            }}
          >
            Complete ({actualNum || 0} units)
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
