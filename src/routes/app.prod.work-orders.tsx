import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CompleteWorkOrderSheet } from "@/modules/production/components/complete-work-order-sheet";
import { WorkOrderCostingSheet } from "@/modules/production/components/work-order-costing-sheet";
import type { ProductionWorkOrderDto } from "@/modules/production/types";
import { workOrderProgress } from "@/modules/production/utils/work-order-progress";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, MoreHorizontal, Download } from "lucide-react";
import { toast } from "sonner";
import {
  useCreateProductionWorkOrder,
  useProductionBoms,
  useProductionMaterialAvailability,
  useProductionWorkOrders,
  useStartProductionWorkOrder,
} from "@/hooks/production/use-production";

export const Route = createFileRoute("/app/prod/work-orders")({ component: WorkOrdersPage });

function statusTone(status: string) {
  if (status === "completed") return "bg-success/15 text-success border-success/30";
  if (status === "in_progress" || status === "released") return "bg-primary/15 text-primary border-primary/30";
  if (status === "cancelled") return "bg-destructive/15 text-destructive border-destructive/30";
  return "bg-muted text-muted-foreground border-border";
}

function WorkOrdersPage() {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("all");
  const [open, setOpen] = useState(false);
  const [bomId, setBomId] = useState("");
  const [plannedQty, setPlannedQty] = useState("1");
  const [scheduledDate, setScheduledDate] = useState("");
  const [notes, setNotes] = useState("");
  const [costingOpen, setCostingOpen] = useState(false);
  const [costingWo, setCostingWo] = useState<ProductionWorkOrderDto | null>(null);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [completeWo, setCompleteWo] = useState<ProductionWorkOrderDto | null>(null);

  const createWorkOrder = useCreateProductionWorkOrder();
  const startWorkOrder = useStartProductionWorkOrder();
  const { data: bomsData } = useProductionBoms({ per_page: 100, status: "active" });
  const { data: rmAvailability } = useProductionMaterialAvailability(bomId ? Number(bomId) : null);
  const { data: workOrdersData, isLoading } = useProductionWorkOrders({
    per_page: 300,
    status: tab === "all" ? undefined : tab,
  });

  const boms = bomsData?.data ?? [];
  const workOrders = (workOrdersData?.data ?? []).filter(
    (wo) =>
      wo.number.toLowerCase().includes(q.toLowerCase()) ||
      (wo.bom_name ?? "").toLowerCase().includes(q.toLowerCase()),
  );

  function resetForm() {
    setBomId("");
    setPlannedQty("1");
    setScheduledDate("");
    setNotes("");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Work Orders"
        description="Track every production order through to completion."
        breadcrumbs={[{ label: "Production" }, { label: "Work Orders" }]}
        actions={
          <>
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-2" />New work order</Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-lg overflow-y-auto">
                <SheetHeader><SheetTitle>Create work order</SheetTitle></SheetHeader>
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
                    <div><Label>Planned quantity</Label><Input type="number" min={1} value={plannedQty} onChange={(event) => setPlannedQty(event.target.value)} /></div>
                    <div><Label>Scheduled date</Label><Input type="date" value={scheduledDate} onChange={(event) => setScheduledDate(event.target.value)} /></div>
                  </div>
                  <div><Label>Notes</Label><Input placeholder="Optional" value={notes} onChange={(event) => setNotes(event.target.value)} /></div>
                  {bomId && (rmAvailability?.lines?.length ?? 0) > 0 && (
                    <div className="rounded-md border p-3 space-y-2">
                      <p className="text-xs font-medium uppercase text-muted-foreground">
                        Raw material on-hand (after receipts)
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
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button
                    onClick={() => {
                      if (!bomId) {
                        toast.error("Select a BOM first");
                        return;
                      }
                      if (Number(plannedQty) <= 0) {
                        toast.error("Planned quantity must be greater than zero");
                        return;
                      }
                      createWorkOrder.mutate(
                        {
                          bom_id: Number(bomId),
                          planned_qty: Number(plannedQty),
                          scheduled_date: scheduledDate || undefined,
                          notes: notes.trim() || undefined,
                          idempotency_key: `wo_${Date.now()}`,
                        },
                        {
                          onSuccess: () => {
                            setOpen(false);
                            resetForm();
                          },
                        },
                      );
                    }}
                    disabled={createWorkOrder.isPending}
                  >
                    Create
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </>
        }
      />

      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-start md:items-center">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="released">Released</TabsTrigger>
              <TabsTrigger value="in_progress">In progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative max-w-sm flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" value={q} onChange={e => setQ(e.target.value)} placeholder="Search work orders..." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-sm text-muted-foreground">Loading work orders...</div>
          ) : workOrders.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No work order found"
                description="Create work orders from BOM to start production execution."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>BOM</TableHead>
                  <TableHead>Planned</TableHead>
                  <TableHead>Actual</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {workOrders.map((wo) => {
                  const progress = workOrderProgress(wo);
                  return (
                    <TableRow key={wo.id}>
                      <TableCell className="font-mono text-xs">{wo.number}</TableCell>
                      <TableCell className="font-medium">{wo.bom_name ?? "-"}</TableCell>
                      <TableCell>{wo.planned_qty}</TableCell>
                      <TableCell>{wo.actual_qty}</TableCell>
                      <TableCell className="text-sm">{wo.scheduled_date ?? "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2" title={progress.label}>
                          <Progress value={progress.value} className="h-1.5 w-24" />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {progress.label}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusTone(wo.status)}>
                          {wo.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {wo.status === "released" ? (
                              <DropdownMenuItem onClick={() => startWorkOrder.mutate(wo.id)}>Start</DropdownMenuItem>
                            ) : null}
                            {(wo.status === "in_progress" || wo.status === "released") ? (
                              <DropdownMenuItem
                                onClick={() => {
                                  setCompleteWo(wo);
                                  setCompleteOpen(true);
                                }}
                              >
                                Complete…
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuItem
                              onClick={() => {
                                setCostingWo(wo);
                                setCostingOpen(true);
                              }}
                            >
                              View costing
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <WorkOrderCostingSheet
        workOrderId={costingWo?.id ?? null}
        open={costingOpen}
        onOpenChange={setCostingOpen}
        summary={costingWo}
      />

      <CompleteWorkOrderSheet
        workOrderId={completeWo?.id ?? null}
        open={completeOpen}
        onOpenChange={setCompleteOpen}
        summary={completeWo}
      />
    </div>
  );
}
