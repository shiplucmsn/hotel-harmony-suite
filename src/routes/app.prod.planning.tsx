import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { StatCard } from "@/components/stat-card";
import { Calendar, ClipboardList, Plus, Factory, TrendingUp } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { toast } from "sonner";
import { useCreateProductionWorkOrder, useProductionBoms, useProductionWorkOrders } from "@/hooks/production/use-production";

export const Route = createFileRoute("/app/prod/planning")({ component: PlanningPage });

function statusTone(status: string) {
  if (status === "completed") return "bg-success/15 text-success border-success/30";
  if (status === "in_progress" || status === "released") return "bg-primary/15 text-primary border-primary/30";
  return "bg-muted text-muted-foreground border-border";
}

function PlanningPage() {
  const [open, setOpen] = useState(false);
  const [bomId, setBomId] = useState("");
  const [plannedQty, setPlannedQty] = useState("1");
  const [scheduledDate, setScheduledDate] = useState("");
  const createWorkOrder = useCreateProductionWorkOrder();
  const { data: bomsData } = useProductionBoms({ per_page: 200, status: "active" });
  const { data: workOrdersData } = useProductionWorkOrders({ per_page: 300 });

  const boms = bomsData?.data ?? [];
  const workOrders = workOrdersData?.data ?? [];

  const stats = useMemo(() => {
    const scheduled = workOrders.filter((wo) => wo.status === "released").length;
    const inProgress = workOrders.filter((wo) => wo.status === "in_progress").length;
    const completed = workOrders.filter((wo) => wo.status === "completed").length;
    const onTimeRate = workOrders.length ? Math.round((completed / workOrders.length) * 100) : 0;
    return { scheduled, inProgress, backlog: Math.max(0, scheduled - completed), onTimeRate };
  }, [workOrders]);

  const productionTrend = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const grouped = new Map<string, { planned: number; actual: number }>();
    days.forEach((day) => grouped.set(day, { planned: 0, actual: 0 }));

    for (const wo of workOrders) {
      const dateStr = wo.scheduled_date ?? wo.created_at;
      if (!dateStr) continue;
      const day = days[new Date(dateStr).getDay()];
      const current = grouped.get(day);
      if (!current) continue;
      current.planned += Number(wo.planned_qty || 0);
      current.actual += Number(wo.actual_qty || 0);
      grouped.set(day, current);
    }

    return days.map((day) => ({ day, planned: grouped.get(day)?.planned ?? 0, actual: grouped.get(day)?.actual ?? 0 }));
  }, [workOrders]);

  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  return (
    <div className="space-y-6">
      <PageHeader
        title="Production Planning"
        description="Schedule and balance work across lines and shifts."
        breadcrumbs={[{ label: "Production" }, { label: "Planning" }]}
        actions={
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-2" />Schedule order</Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-lg">
              <SheetHeader><SheetTitle>Schedule production order</SheetTitle></SheetHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>BOM</Label>
                  <Select value={bomId} onValueChange={setBomId}>
                    <SelectTrigger><SelectValue placeholder="Select BOM" /></SelectTrigger>
                    <SelectContent>
                      {boms.map((bom) => (
                        <SelectItem key={bom.id} value={String(bom.id)}>
                          {(bom.code ?? `BOM-${bom.id}`) + " · " + bom.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Planned qty</Label><Input type="number" min={1} value={plannedQty} onChange={(event) => setPlannedQty(event.target.value)} /></div>
                  <div><Label>Scheduled date</Label><Input type="date" value={scheduledDate} onChange={(event) => setScheduledDate(event.target.value)} /></div>
                </div>
              </div>
              <SheetFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
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
                        idempotency_key: `plan_${Date.now()}`,
                      },
                      {
                        onSuccess: () => {
                          setOpen(false);
                          setBomId("");
                          setPlannedQty("1");
                          setScheduledDate("");
                        },
                      },
                    );
                  }}
                  disabled={createWorkOrder.isPending}
                >
                  Schedule
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Scheduled WO" value={String(stats.scheduled)} icon={Calendar} />
        <StatCard label="In progress" value={String(stats.inProgress)} icon={Factory} />
        <StatCard label="Backlog" value={String(stats.backlog)} icon={ClipboardList} />
        <StatCard label="On-time rate" value={`${stats.onTimeRate}%`} icon={TrendingUp} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Planned vs actual (this week)</CardTitle></CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="planned" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
                <Bar dataKey="actual" fill="hsl(var(--success))" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Capacity</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { line: "Line A", load: Math.min(100, stats.scheduled * 12) },
              { line: "Line B", load: Math.min(100, stats.inProgress * 15) },
              { line: "Line C", load: Math.min(100, stats.backlog * 20) },
              { line: "QC Cell", load: Math.min(100, Math.max(5, Math.round(stats.onTimeRate / 2))) },
            ].map(l => (
              <div key={l.line} className="space-y-1">
                <div className="flex justify-between text-sm"><span>{l.line}</span><span className="text-muted-foreground">{l.load}%</span></div>
                <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full gradient-primary" style={{ width: `${l.load}%` }} /></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Schedule board</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 text-xs">
            {days.map((d, i) => (
              <div key={d} className="rounded-lg border bg-muted/30 p-2 min-h-[140px]">
                <div className="font-semibold mb-2">{d}</div>
                {workOrders
                  .filter((wo) => {
                    const source = wo.scheduled_date ?? wo.created_at;
                    if (!source) return false;
                    const day = new Date(source).toLocaleDateString("en-US", { weekday: "short" });
                    return day === d;
                  })
                  .slice(0, 2)
                  .map((wo) => (
                    <div key={wo.id} className="mb-1.5 rounded-md border bg-card p-2">
                      <div className="font-medium truncate">{wo.bom_name ?? wo.number}</div>
                      <div className="text-muted-foreground">{wo.planned_qty} units</div>
                      <Badge variant="outline" className={`mt-1 ${statusTone(wo.status)} text-[10px]`}>{wo.status}</Badge>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
