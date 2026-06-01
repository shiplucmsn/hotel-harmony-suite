import type { ProductionWorkOrderDto } from "@/modules/production/types";

export type WorkOrderProgressDisplay = {
  /** 0–100 for Progress bar */
  value: number;
  /** Short label next to bar */
  label: string;
};

/**
 * Production progress is two-phase:
 * - Before complete: workflow status (released → in progress)
 * - After complete: actual finished qty vs planned
 */
export function workOrderProgress(wo: ProductionWorkOrderDto): WorkOrderProgressDisplay {
  if (wo.status === "completed") {
    const pct =
      wo.planned_qty > 0
        ? Math.min(100, Math.round((wo.actual_qty / wo.planned_qty) * 100))
        : 100;

    return { value: pct, label: `${pct}%` };
  }

  if (wo.status === "cancelled") {
    return { value: 0, label: "Cancelled" };
  }

  if (wo.status === "in_progress") {
    return { value: 60, label: "In production" };
  }

  if (wo.status === "released") {
    return { value: 25, label: "Released" };
  }

  return { value: 10, label: "Draft" };
}
