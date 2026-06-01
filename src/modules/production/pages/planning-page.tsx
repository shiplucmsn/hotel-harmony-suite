import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Factory,
  Loader2,
  Plus,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SearchableSelect } from "@/shared/components/forms/searchable-select";
import { StatCard } from "@/components/stat-card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/rbac/use-permissions";
import {
  useCreateProductionWorkOrder,
  useProductionBoms,
  useProductionBom,
  useProductionMaterialAvailability,
  useProductionPlanning,
} from "@/hooks/production/use-production";

function statusTone(status: string) {
  if (status === "completed") return "bg-success/15 text-success border-success/30";
  if (status === "in_progress" || status === "released") return "bg-primary/15 text-primary border-primary/30";
  if (status === "cancelled") return "bg-destructive/15 text-destructive border-destructive/30";
  return "bg-muted text-muted-foreground border-border";
}

function mondayOfWeek(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatWeekRange(start: string, end: string) {
  const fmt = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
  return `${fmt.format(new Date(start + "T12:00:00"))} – ${fmt.format(new Date(end + "T12:00:00"))}`;
}

export function PlanningPage() {
  const { can } = usePermissions();
  const canManage = can("production.boms.manage");

  const [weekStart, setWeekStart] = useState(() => mondayOfWeek(new Date()));
  const [open, setOpen] = useState(false);
  const [bomId, setBomId] = useState("");
  const [plannedQty, setPlannedQty] = useState("1");
  const [scheduledDate, setScheduledDate] = useState("");

  const { data: planning, isLoading, isError, isFetching, refetch } = useProductionPlanning(weekStart);
  const {
    data: bomsData,
    isLoading: bomsLoading,
    isError: bomsError,
    refetch: refetchBoms,
  } = useProductionBoms({ per_page: 100, status: "active" });
  const { data: rmAvailability } = useProductionMaterialAvailability(bomId ? Number(bomId) : null);
  const createWorkOrder = useCreateProductionWorkOrder();

  const boms = bomsData?.data ?? [];
  const activeBoms = boms.filter((b) => String(b.status).toLowerCase() === "active");

  const bomOptions = useMemo(
    () =>
      [...activeBoms]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((bom) => ({
          value: String(bom.id),
          label: `${bom.code ?? `BOM-${bom.id}`} · ${bom.name}${bom.sku ? ` (${bom.sku})` : ""}`,
          keywords: [bom.code, bom.name, bom.sku].filter(Boolean).join(" "),
        })),
    [activeBoms],
  );

  const selectedBomSummary = boms.find((b) => String(b.id) === bomId);
  const { data: selectedBomDetail } = useProductionBom(bomId || null);
  const selectedBom = selectedBomDetail ?? selectedBomSummary;
  const summary = planning?.summary;
  const trend = planning?.trend ?? [];
  const schedule = planning?.schedule ?? [];
  const capacity = planning?.capacity ?? [];

  const weekLabel = useMemo(() => {
    if (!planning?.week_start || !planning?.week_end) return "";
    return formatWeekRange(planning.week_start, planning.week_end);
  }, [planning?.week_start, planning?.week_end]);

  function resetForm() {
    setBomId("");
    setPlannedQty("1");
    setScheduledDate("");
  }

  useEffect(() => {
    if (!open) return;
    const today = new Date().toISOString().slice(0, 10);
    const weekEnd = planning?.week_end ?? addDays(weekStart, 6);
    setScheduledDate(today >= weekStart && today <= weekEnd ? today : weekStart);
  }, [open, weekStart, planning?.week_end]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Production Planning"
        description="Schedule work orders by week; capacity is derived from warehouse load on real work orders."
        breadcrumbs={[{ label: "Production" }, { label: "Planning" }]}
        actions={
          canManage ? (
            <Sheet
              open={open}
              onOpenChange={(next) => {
                setOpen(next);
                if (!next) resetForm();
              }}
            >
              <SheetTrigger asChild>
                <Button size="sm" className="gradient-primary text-primary-foreground border-0">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule order
                </Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Schedule production order</SheetTitle>
                  <SheetDescription>
                    Creates a released work order on the selected BOM for the week shown on the board.
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="schedule-bom">Bill of materials (BOM)</Label>
                    {bomsLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading BOMs…
                      </div>
                    ) : bomsError ? (
                      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm space-y-2">
                        <p className="text-destructive">Could not load BOM list.</p>
                        <Button variant="outline" size="sm" onClick={() => refetchBoms()}>
                          Retry
                        </Button>
                      </div>
                    ) : activeBoms.length === 0 ? (
                      <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground space-y-2">
                        <p>No active BOM found. Create a BOM with a finished product and raw material lines first.</p>
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/app/prod/bom">Go to BOM</Link>
                        </Button>
                      </div>
                    ) : (
                      <SearchableSelect
                        value={bomId}
                        onValueChange={setBomId}
                        options={bomOptions}
                        placeholder="Search BOM by name, code, or SKU…"
                        searchPlaceholder="Search BOM…"
                        emptyMessage="No BOM matches your search."
                        inOverlay
                        className="w-full"
                      />
                    )}
                  </div>
                  {selectedBom && (
                    <div className="rounded-md border bg-muted/30 p-3 text-sm space-y-1">
                      <div className="font-medium">{selectedBom.name}</div>
                      <div className="text-muted-foreground">
                        Finished SKU:{" "}
                        <span className="font-mono text-xs">{selectedBom.sku ?? "—"}</span>
                        {" · "}
                        {selectedBom.lines.length} component line
                        {selectedBom.lines.length === 1 ? "" : "s"}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="schedule-qty">Planned quantity</Label>
                      <Input
                        id="schedule-qty"
                        type="number"
                        min={0.001}
                        step="0.001"
                        value={plannedQty}
                        onChange={(e) => setPlannedQty(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="schedule-date">Scheduled date</Label>
                      <Input
                        id="schedule-date"
                        type="date"
                        value={scheduledDate}
                        min={weekStart}
                        max={planning?.week_end ?? addDays(weekStart, 6)}
                        onChange={(e) => setScheduledDate(e.target.value)}
                      />
                    </div>
                  </div>
                  {bomId && (rmAvailability?.lines?.length ?? 0) > 0 && (
                    <div className="rounded-md border p-3 space-y-2">
                      <p className="text-xs font-medium uppercase text-muted-foreground">
                        Material availability (inventory)
                      </p>
                      {rmAvailability!.lines.map((line) => (
                        <div key={line.sku} className="flex justify-between text-sm">
                          <span className="font-mono text-xs">{line.sku}</span>
                          <span>
                            {line.on_hand} on hand
                            {line.sufficient_for_one_batch === false && (
                              <span className="text-destructive ml-1">· low</span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <SheetFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (!bomId) {
                        toast.error("Select BOM first");
                        return;
                      }
                      createWorkOrder.mutate(
                        {
                          bom_id: Number(bomId),
                          planned_qty: Number(plannedQty || 1),
                          scheduled_date: scheduledDate || undefined,
                          status: "released",
                          idempotency_key: `plan_${bomId}_${scheduledDate || weekStart}_${Date.now()}`,
                        },
                        {
                          onSuccess: () => {
                            setOpen(false);
                            resetForm();
                            refetch();
                          },
                        },
                      );
                    }}
                    disabled={createWorkOrder.isPending || activeBoms.length === 0}
                  >
                    Schedule
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          ) : undefined
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous week"
            onClick={() => setWeekStart((prev) => addDays(prev, -7))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium min-w-[140px] text-center">
            {weekLabel || "This week"}
            {isFetching && !isLoading && (
              <Loader2 className="inline-block ml-2 h-3.5 w-3.5 animate-spin text-muted-foreground" />
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            aria-label="Next week"
            onClick={() => setWeekStart((prev) => addDays(prev, 7))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setWeekStart(mondayOfWeek(new Date()))}>
            Today
          </Button>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/app/prod/work-orders">Open work orders</Link>
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading planning data…
        </div>
      )}

      {isError && !isLoading && (
        <EmptyState
          title="Could not load planning"
          description="Check your connection and production permissions, then try again."
          action={
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      )}

      {!isLoading && !isError && planning && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard label="Released (scheduled)" value={String(summary?.scheduled ?? 0)} icon={Calendar} />
            <StatCard label="In progress" value={String(summary?.in_progress ?? 0)} icon={Factory} />
            <StatCard label="Backlog (draft + released)" value={String(summary?.backlog ?? 0)} icon={ClipboardList} />
            <StatCard label="On-time rate" value={`${summary?.on_time_rate ?? 0}%`} icon={TrendingUp} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Planned vs actual</CardTitle>
              </CardHeader>
              <CardContent className="h-[280px]">
                {trend.every((d) => d.planned === 0 && d.actual === 0) ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No work orders scheduled this week.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                        }}
                      />
                      <Legend />
                      <Bar dataKey="planned" name="Planned qty" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="actual" name="Actual qty" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Warehouse load (this week)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {capacity.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No active work orders this week.</p>
                ) : (
                  capacity.map((row) => (
                    <div key={`${row.warehouse_id ?? "na"}-${row.name}`} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{row.name}</span>
                        <span className="text-muted-foreground">
                          {row.work_order_count} WO · {row.planned_qty} units · {row.load_percent}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full gradient-primary"
                          style={{ width: `${row.load_percent}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Schedule board</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
                {schedule.map((day) => (
                  <div key={day.date} className="rounded-lg border bg-muted/30 p-2 min-h-[160px]">
                    <div className="font-semibold mb-0.5">{day.label}</div>
                    <div className="text-[10px] text-muted-foreground mb-2">{day.date}</div>
                    {day.work_orders.length === 0 ? (
                      <p className="text-muted-foreground text-[10px]">—</p>
                    ) : (
                      day.work_orders.map((wo) => (
                        <Link
                          key={wo.id}
                          to="/app/prod/work-orders"
                          className="mb-1.5 block rounded-md border bg-card p-2 hover:bg-accent/50 transition-colors"
                        >
                          <div className="font-medium truncate">{wo.bom_name ?? wo.number}</div>
                          <div className="text-muted-foreground font-mono text-[10px]">{wo.number}</div>
                          <div className="text-muted-foreground">{wo.planned_qty} planned</div>
                          {wo.warehouse_name && (
                            <div className="text-[10px] text-muted-foreground truncate">{wo.warehouse_name}</div>
                          )}
                          <Badge variant="outline" className={`mt-1 ${statusTone(wo.status)} text-[10px]`}>
                            {wo.status}
                          </Badge>
                        </Link>
                      ))
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
