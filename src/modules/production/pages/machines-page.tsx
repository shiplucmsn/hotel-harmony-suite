import { useMemo, useState } from "react";
import { Activity, Cpu, Loader2, Plus, Power, RefreshCw, Search, Settings2, Wrench } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/stat-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { prodTone } from "@/lib/production-mock";
import { usePermissions } from "@/hooks/rbac/use-permissions";
import {
  useCreateProductionMachine,
  useProductionMachines,
  useUpdateProductionMachine,
} from "@/hooks/production/use-production";
import type { ProductionMachineDto, UpdateProductionMachineInput } from "@/modules/production/types";

const MACHINE_STATUSES = ["running", "idle", "maintenance", "down"] as const;

type MachineFormState = {
  code: string;
  name: string;
  production_line: string;
  status: (typeof MACHINE_STATUSES)[number];
  uptime_pct: string;
  oee_pct: string;
  last_service_date: string;
  notes: string;
};

function emptyForm(): MachineFormState {
  return {
    code: "",
    name: "",
    production_line: "",
    status: "idle",
    uptime_pct: "0",
    oee_pct: "0",
    last_service_date: "",
    notes: "",
  };
}

function formFromMachine(m: ProductionMachineDto): MachineFormState {
  return {
    code: m.code,
    name: m.name,
    production_line: m.production_line ?? m.line ?? "",
    status: (MACHINE_STATUSES.includes(m.status as (typeof MACHINE_STATUSES)[number])
      ? m.status
      : "idle") as MachineFormState["status"],
    uptime_pct: String(m.uptime ?? m.uptime_pct ?? 0),
    oee_pct: String(m.oee ?? m.oee_pct ?? 0),
    last_service_date: m.last_service_date ?? m.last_service ?? "",
    notes: m.notes ?? "",
  };
}

function toPayload(form: MachineFormState): UpdateProductionMachineInput {
  return {
    code: form.code.trim() || undefined,
    name: form.name.trim(),
    production_line: form.production_line.trim() || undefined,
    status: form.status,
    uptime_pct: Number(form.uptime_pct) || 0,
    oee_pct: Number(form.oee_pct) || 0,
    last_service_date: form.last_service_date || undefined,
    notes: form.notes.trim() || undefined,
  };
}

export function MachinesPage() {
  const { can } = usePermissions();
  const canManage = can("production.boms.manage");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<ProductionMachineDto | null>(null);
  const [form, setForm] = useState<MachineFormState>(emptyForm);

  const listParams = useMemo(
    () => ({
      per_page: 100,
      search: search.trim() || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
    }),
    [search, statusFilter],
  );

  const { data, isLoading, isError, refetch, isFetching } = useProductionMachines(listParams);
  const createMachine = useCreateProductionMachine();
  const updateMachine = useUpdateProductionMachine();

  const machines = data?.data ?? [];
  const summary = data?.summary;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setSheetOpen(true);
  };

  const openEdit = (m: ProductionMachineDto) => {
    setEditing(m);
    setForm(formFromMachine(m));
    setSheetOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    const body = toPayload(form);
    if (editing) {
      await updateMachine.mutateAsync({ id: editing.id, body });
    } else {
      await createMachine.mutateAsync(body);
    }
    setSheetOpen(false);
  };

  const saving = createMachine.isPending || updateMachine.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Machine Management"
        description="Monitor uptime, OEE, and maintenance windows."
        breadcrumbs={[{ label: "Production" }, { label: "Machines" }]}
        actions={
          canManage ? (
            <Button size="sm" className="gradient-primary text-primary-foreground border-0" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add machine
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search name, code, line…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {MACHINE_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh">
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total machines" value={String(summary?.total ?? machines.length)} icon={Cpu} />
        <StatCard label="Running" value={String(summary?.running ?? 0)} icon={Power} />
        <StatCard
          label="Maintenance / down"
          value={String(summary?.down_or_maintenance ?? 0)}
          icon={Wrench}
        />
        <StatCard label="Avg OEE" value={`${summary?.avg_oee ?? 0}%`} icon={Activity} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <EmptyState
          title="Could not load machines"
          description="Check your connection and production module access, then retry."
          action={
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      ) : machines.length === 0 ? (
        <EmptyState
          icon={Cpu}
          title="No machines yet"
          description={
            search || statusFilter !== "all"
              ? "Try clearing filters or add a new machine."
              : "Register production equipment to track uptime and OEE."
          }
          action={
            canManage ? (
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add machine
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {machines.map((m) => (
            <Card key={m.id} className="transition-all hover:shadow-elegant hover:-translate-y-0.5">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{m.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {m.code}
                      {(m.production_line ?? m.line) ? ` · ${m.production_line ?? m.line}` : ""}
                    </p>
                  </div>
                  <Badge variant="outline" className={prodTone(m.status)}>
                    {m.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Uptime</span>
                    <span>{m.uptime}%</span>
                  </div>
                  <Progress value={m.uptime} className="h-1.5" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">OEE</span>
                    <span>{m.oee}%</span>
                  </div>
                  <Progress value={m.oee} className="h-1.5" />
                </div>
                <div className="flex items-center justify-between border-t pt-2 text-xs">
                  <span className="text-muted-foreground">
                    Last service: {m.last_service ?? m.last_service_date ?? "—"}
                  </span>
                  {canManage && (
                    <Button variant="ghost" size="sm" onClick={() => openEdit(m)} aria-label="Edit machine">
                      <Settings2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{editing ? "Edit machine" : "Add machine"}</SheetTitle>
            <SheetDescription>
              Equipment master data for production floor monitoring. OEE and uptime are stored metrics until live
              telemetry is connected.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="machine-code">Code</Label>
              <Input
                id="machine-code"
                placeholder="MC-01"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="machine-name">Name *</Label>
              <Input
                id="machine-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="machine-line">Production line</Label>
              <Input
                id="machine-line"
                placeholder="Line A"
                value={form.production_line}
                onChange={(e) => setForm((f) => ({ ...f, production_line: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as MachineFormState["status"] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MACHINE_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="machine-uptime">Uptime %</Label>
                <Input
                  id="machine-uptime"
                  type="number"
                  min={0}
                  max={100}
                  value={form.uptime_pct}
                  onChange={(e) => setForm((f) => ({ ...f, uptime_pct: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="machine-oee">OEE %</Label>
                <Input
                  id="machine-oee"
                  type="number"
                  min={0}
                  max={100}
                  value={form.oee_pct}
                  onChange={(e) => setForm((f) => ({ ...f, oee_pct: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="machine-service">Last service date</Label>
              <Input
                id="machine-service"
                type="date"
                value={form.last_service_date}
                onChange={(e) => setForm((f) => ({ ...f, last_service_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="machine-notes">Notes</Label>
              <Input
                id="machine-notes"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setSheetOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => void handleSubmit()}
              disabled={saving || !form.name.trim()}
              className="gradient-primary text-primary-foreground border-0"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editing ? "Save changes" : "Create machine"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
