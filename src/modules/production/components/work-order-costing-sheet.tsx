import { Link } from "@tanstack/react-router";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProductionWorkOrder } from "@/hooks/production/use-production";
import { formatMoney, journalLineTotals } from "@/modules/finance/utils";
import type { ProductionWorkOrderDto } from "@/modules/production/types";

type WorkOrderCostingSheetProps = {
  workOrderId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary?: ProductionWorkOrderDto | null;
};

export function WorkOrderCostingSheet({
  workOrderId,
  open,
  onOpenChange,
  summary,
}: WorkOrderCostingSheetProps) {
  const { data: detail, isLoading, isError } = useProductionWorkOrder(open ? workOrderId : null);
  const wo = detail ?? summary;
  const isCompleted = wo?.status === "completed";

  const readiness = detail?.material_readiness ?? [];
  const hasShortfall = readiness.some((row) => !row.sufficient);

  const displayMaterialCost = isCompleted
    ? wo?.raw_material_cost ?? 0
    : detail?.estimated_material_cost ??
      wo?.materials.reduce((sum, line) => sum + line.planned_qty * line.unit_cost, 0) ??
      0;

  const displayTotalCost = isCompleted
    ? wo?.total_cost ?? 0
    : displayMaterialCost + (wo?.overhead_cost ?? 0);

  const journal = detail?.journal_entry;
  const journalTotals = journal?.lines ? journalLineTotals(journal.lines) : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Production costing</SheetTitle>
          <SheetDescription className="font-mono">{wo?.number ?? "Work order"}</SheetDescription>
        </SheetHeader>

        {isLoading && !detail ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading costing…
          </div>
        ) : isError && !wo ? (
          <p className="py-8 text-sm text-destructive">Could not load work order costing.</p>
        ) : !wo ? null : (
          <div className="mt-4 space-y-6 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{wo.status.replace("_", " ")}</Badge>
              {wo.bom_name ? <span className="text-muted-foreground">{wo.bom_name}</span> : null}
            </div>

            {!isCompleted && (
              <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-sm space-y-1">
                <p>
                  Figures below are <strong>planned</strong> until you complete the work order. Actual
                  costs and journal posting run on <strong>Complete</strong>.
                </p>
              </div>
            )}

            {!isCompleted && hasShortfall && (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm flex gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Not enough stock to complete</p>
                  <p className="text-muted-foreground mt-1">
                    Receive materials via Purchase GRN or Inventory → Adjustments (default warehouse),
                    then complete again.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <CostCell
                label={isCompleted ? "Raw material cost" : "Est. raw material cost"}
                value={formatMoney(displayMaterialCost)}
              />
              <CostCell label="Overhead" value={formatMoney(wo.overhead_cost)} />
              <CostCell
                label={isCompleted ? "Total production cost" : "Est. total cost"}
                value={formatMoney(displayTotalCost)}
                className="col-span-2"
              />
              <CostCell label="Finished qty (planned)" value={String(wo.planned_qty)} />
              <CostCell
                label={isCompleted ? "Finished qty (actual)" : "Finished qty (actual)"}
                value={String(wo.actual_qty)}
              />
            </div>

            {readiness.length > 0 && (
              <section className="space-y-2">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                  Material readiness (warehouse)
                </h4>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">Need</TableHead>
                        <TableHead className="text-right">Available</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {readiness.map((row) => (
                        <TableRow key={row.sku}>
                          <TableCell className="font-mono text-xs">
                            {row.sku}
                            {!row.sufficient && (
                              <span className="block text-[10px] text-destructive">Short {row.shortfall}</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">{row.planned_qty}</TableCell>
                          <TableCell className="text-right">{row.available_qty}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </section>
            )}

            {wo.materials.length > 0 && (
              <section className="space-y-2">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                  Raw materials {isCompleted ? "(actual)" : "(planned)"}
                </h4>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">{isCompleted ? "Actual" : "Planned"}</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {wo.materials.map((line) => (
                        <TableRow key={line.id}>
                          <TableCell className="font-mono text-xs">{line.sku}</TableCell>
                          <TableCell className="text-right">
                            {isCompleted ? line.actual_qty : line.planned_qty}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatMoney(
                              isCompleted ? line.line_cost : line.planned_qty * line.unit_cost,
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </section>
            )}

            {wo.outputs.length > 0 && (
              <section className="space-y-2">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                  Finished output {isCompleted ? "(actual)" : "(planned)"}
                </h4>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">{isCompleted ? "Actual" : "Planned"}</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {wo.outputs.map((line) => (
                        <TableRow key={line.id}>
                          <TableCell className="font-mono text-xs">{line.sku}</TableCell>
                          <TableCell className="text-right">
                            {isCompleted ? line.actual_qty : line.planned_qty}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatMoney(
                              isCompleted ? line.line_cost : line.planned_qty * line.unit_cost,
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </section>
            )}

            <section className="space-y-2">
              <h4 className="text-xs font-semibold uppercase text-muted-foreground">Finance journal</h4>
              {isCompleted && journal ? (
                <div className="rounded-md border p-3 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono font-medium">{journal.entry_number}</span>
                    <Badge variant="outline">{journal.status}</Badge>
                  </div>
                  <p className="text-muted-foreground">{journal.memo}</p>
                  {journal.lines && journal.lines.length > 0 ? (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Account</TableHead>
                            <TableHead className="text-right">Debit</TableHead>
                            <TableHead className="text-right">Credit</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {journal.lines.map((line) => (
                            <TableRow key={line.id}>
                              <TableCell className="font-mono text-xs">{line.account_code}</TableCell>
                              <TableCell className="text-right">{formatMoney(line.debit)}</TableCell>
                              <TableCell className="text-right">{formatMoney(line.credit)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {journalTotals && (
                        <p className="text-xs text-muted-foreground text-right">
                          Dr {formatMoney(journalTotals.debit)} · Cr {formatMoney(journalTotals.credit)}
                        </p>
                      )}
                    </>
                  ) : null}
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/app/finance/journal">Open journal module</Link>
                  </Button>
                </div>
              ) : isCompleted && wo.journal_entry_id ? (
                <p className="text-muted-foreground">
                  Journal entry #{wo.journal_entry_id} is linked; open Finance → Journal for lines.
                </p>
              ) : isCompleted ? (
                <p className="text-muted-foreground">No finance journal was posted for this completion.</p>
              ) : (
                <p className="text-muted-foreground">Journal posts when the work order is completed.</p>
              )}
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CostCell({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
