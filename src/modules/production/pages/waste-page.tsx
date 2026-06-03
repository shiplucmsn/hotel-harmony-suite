import { useMemo, useState } from "react";
import {
  DollarSign,
  Loader2,
  Pencil,
  Plus,
  Recycle,
  RefreshCw,
  Search,
  Trash2,
  TrendingDown,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { StatCard } from "@/components/stat-card";
import { SearchableSelect } from "@/shared/components/forms/searchable-select";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { usePermissions } from "@/hooks/rbac/use-permissions";
import {
  useCreateProductionWasteRecord,
  useProductionProductSkus,
  useProductionWasteRecords,
  useUpdateProductionWasteRecord,
} from "@/hooks/production/use-production";
import type {
  ProductionWasteRecordDto,
  UpdateProductionWasteRecordInput,
} from "@/modules/production/types";

const WASTE_REASONS = [
  { value: "defective", label: "Defective" },
  { value: "spillage", label: "Spillage" },
  { value: "expiry", label: "Expiry" },
  { value: "out_of_spec", label: "Out of spec" },
  { value: "other", label: "Other" },
] as const;

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--warning))",
  "hsl(var(--success))",
  "hsl(var(--destructive))",
  "hsl(var(--muted-foreground))",
];

type WasteFormState = {
  reference: string;
  source: string;
  reason: string;
  product_sku: string;
  quantity: string;
  unit_cost: string;
  recovered_amount: string;
  deduct_stock: boolean;
  waste_date: string;
  notes: string;
};

function emptyForm(): WasteFormState {
  return {
    reference: "",
    source: "",
    reason: "defective",
    product_sku: "",
    quantity: "1",
    unit_cost: "",
    recovered_amount: "0",
    deduct_stock: false,
    waste_date: new Date().toISOString().slice(0, 10),
    notes: "",
  };
}

function formFromRecord(w: ProductionWasteRecordDto): WasteFormState {
  return {
    reference: w.reference ?? w.ref,
    source: w.source ?? "",
    reason: w.reason,
    product_sku: w.product_sku ?? "",
    quantity: String(w.quantity ?? w.qty),
    unit_cost: String(w.unit_cost ?? 0),
    recovered_amount: String(w.recovered_amount ?? 0),
    deduct_stock: false,
    waste_date: w.waste_date ?? w.date ?? new Date().toISOString().slice(0, 10),
    notes: w.notes ?? "",
  };
}

function reasonLabel(reason: string) {
  return WASTE_REASONS.find((r) => r.value === reason)?.label ?? reason.replace(/_/g, " ");
}

function toCreatePayload(form: WasteFormState): UpdateProductionWasteRecordInput & { quantity: number; reason: string } {
  const qty = Number(form.quantity) || 0;
  const unitCost = Number(form.unit_cost) || 0;
  return {
    reference: form.reference.trim() || undefined,
    source: form.source.trim() || undefined,
    reason: form.reason,
    product_sku: form.product_sku.trim() || undefined,
    quantity: qty,
    unit_cost: unitCost > 0 ? unitCost : undefined,
    recovered_amount: Number(form.recovered_amount) || 0,
    deduct_stock: form.deduct_stock,
    waste_date: form.waste_date || undefined,
    notes: form.notes.trim() || undefined,
  };
}

export function WastePage() {
  const { can } = usePermissions();
  const canManage = can("production.boms.manage");

  const [search, setSearch] = useState("");
  const [reasonFilter, setReasonFilter] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<ProductionWasteRecordDto | null>(null);
  const [form, setForm] = useState<WasteFormState>(emptyForm);

  const listParams = useMemo(
    () => ({
      per_page: 100,
      search: search.trim() || undefined,
      reason: reasonFilter === "all" ? undefined : reasonFilter,
    }),
    [search, reasonFilter],
  );

  const { data, isLoading, isError, refetch, isFetching } = useProductionWasteRecords(listParams);
  const { data: skuData } = useProductionProductSkus({ per_page: 100 });
  const createWaste = useCreateProductionWasteRecord();
  const updateWaste = useUpdateProductionWasteRecord();

  const records = data?.data ?? [];
  const summary = data?.summary;

  const pieData = useMemo(
    () =>
      (summary?.by_reason ?? []).map((row) => ({
        name: reasonLabel(row.reason),
        value: row.cost,
      })),
    [summary],
  );

  const skuOptions = useMemo(
    () =>
      (skuData?.data ?? []).map((p) => ({
        value: p.sku,
        label: `${p.sku} — ${p.name}`,
        keywords: `${p.sku} ${p.name}`,
      })),
    [skuData],
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setSheetOpen(true);
  };

  const openEdit = (w: ProductionWasteRecordDto) => {
    setEditing(w);
    setForm(formFromRecord(w));
    setSheetOpen(true);
  };

  const handleSubmit = async () => {
    if (editing) {
      await updateWaste.mutateAsync({
        id: editing.id,
        body: {
          reference: form.reference.trim() || undefined,
          source: form.source.trim() || undefined,
          reason: form.reason,
          recovered_amount: Number(form.recovered_amount) || 0,
          waste_date: form.waste_date,
          notes: form.notes.trim() || undefined,
        },
      });
    } else {
      const body = toCreatePayload(form);
      if (body.quantity <= 0) return;
      await createWaste.mutateAsync(body);
    }
    setSheetOpen(false);
  };

  const saving = createWaste.isPending || updateWaste.isPending;
  const previewCost =
    (Number(form.quantity) || 0) *
    (Number(form.unit_cost) ||
      skuData?.data?.find((p) => p.sku === form.product_sku)?.cost_price ||
      0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Waste Management"
        description="Reduce loss across production lines and storage."
        breadcrumbs={[{ label: "Production" }, { label: "Waste" }]}
        actions={
          canManage ? (
            <Button size="sm" className="gradient-primary text-primary-foreground border-0" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Log waste
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search ref, source, SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={reasonFilter} onValueChange={setReasonFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Reason" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All reasons</SelectItem>
            {WASTE_REASONS.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh">
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Waste cost"
          value={`$${(summary?.total_cost ?? 0).toLocaleString()}`}
          icon={DollarSign}
        />
        <StatCard label="Records" value={String(summary?.total_records ?? records.length)} icon={Trash2} />
        <StatCard
          label="Recovered"
          value={`$${(summary?.total_recovered ?? 0).toLocaleString()}`}
          icon={Recycle}
        />
        <StatCard
          label="Total qty lost"
          value={String(summary?.total_quantity ?? 0)}
          icon={TrendingDown}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Waste log</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : isError ? (
              <div className="p-6">
                <EmptyState
                  title="Could not load waste records"
                  action={
                    <Button variant="outline" onClick={() => refetch()}>
                      Retry
                    </Button>
                  }
                />
              </div>
            ) : records.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={Trash2}
                  title="No waste logged"
                  description="Track scrap, spillage, and QC rejects with optional inventory deduction."
                  action={
                    canManage ? (
                      <Button onClick={openCreate}>
                        <Plus className="h-4 w-4 mr-2" />
                        Log waste
                      </Button>
                    ) : undefined
                  }
                />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ref</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Date</TableHead>
                    {canManage && <TableHead className="w-10" />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((w) => (
                    <TableRow key={w.id}>
                      <TableCell className="font-mono text-xs">{w.ref ?? w.reference}</TableCell>
                      <TableCell>{w.source ?? "—"}</TableCell>
                      <TableCell>{w.reason_label ?? reasonLabel(w.reason)}</TableCell>
                      <TableCell className="text-sm">
                        {w.product_name ?? w.product_sku ?? "—"}
                      </TableCell>
                      <TableCell>{w.qty ?? w.quantity}</TableCell>
                      <TableCell className="text-destructive font-medium">
                        ${(w.cost ?? w.total_cost).toLocaleString()}
                        {w.deduct_stock ? (
                          <span className="block text-[10px] text-muted-foreground font-normal">stock deducted</span>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-sm">{w.date ?? w.waste_date}</TableCell>
                      {canManage && (
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(w)} aria-label="Edit waste">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>By reason</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            {pieData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">No cost data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, "Cost"]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{editing ? "Edit waste record" : "Log waste"}</SheetTitle>
            <SheetDescription>
              {editing
                ? "Quantity and stock deduction cannot be changed after create. Update source, reason, recovery, or notes."
                : "Optional deduct stock removes inventory via a waste movement in the default warehouse."}
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="waste-ref">Reference</Label>
              <Input
                id="waste-ref"
                placeholder="WST-0098"
                value={form.reference}
                onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
                disabled={!!editing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="waste-source">Source</Label>
              <Input
                id="waste-source"
                placeholder="Line A, QC reject…"
                value={form.source}
                onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Reason *</Label>
              <Select value={form.reason} onValueChange={(v) => setForm((f) => ({ ...f, reason: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WASTE_REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!editing && (
              <>
                <div className="space-y-2">
                  <Label>Product SKU (for stock deduct)</Label>
                  <SearchableSelect
                    value={form.product_sku}
                    onValueChange={(sku) => {
                      const match = skuData?.data?.find((p) => p.sku === sku);
                      setForm((f) => ({
                        ...f,
                        product_sku: sku,
                        unit_cost: match?.cost_price ? String(match.cost_price) : f.unit_cost,
                      }));
                    }}
                    options={skuOptions}
                    placeholder="Select SKU…"
                    inOverlay
                    modal={false}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="waste-qty">Quantity *</Label>
                    <Input
                      id="waste-qty"
                      type="number"
                      min={0.001}
                      step="any"
                      value={form.quantity}
                      onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="waste-unit-cost">Unit cost</Label>
                    <Input
                      id="waste-unit-cost"
                      type="number"
                      min={0}
                      step="any"
                      value={form.unit_cost}
                      onChange={(e) => setForm((f) => ({ ...f, unit_cost: e.target.value }))}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Estimated cost: <span className="font-medium text-foreground">${previewCost.toFixed(2)}</span>
                </p>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="waste-deduct"
                    checked={form.deduct_stock}
                    onCheckedChange={(c) => setForm((f) => ({ ...f, deduct_stock: c === true }))}
                  />
                  <Label htmlFor="waste-deduct" className="font-normal cursor-pointer">
                    Deduct from inventory stock
                  </Label>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="waste-recovered">Recovered amount</Label>
              <Input
                id="waste-recovered"
                type="number"
                min={0}
                value={form.recovered_amount}
                onChange={(e) => setForm((f) => ({ ...f, recovered_amount: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="waste-date">Date</Label>
              <Input
                id="waste-date"
                type="date"
                value={form.waste_date}
                onChange={(e) => setForm((f) => ({ ...f, waste_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="waste-notes">Notes</Label>
              <Input
                id="waste-notes"
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
              disabled={saving || (!editing && (Number(form.quantity) || 0) <= 0)}
              className="gradient-primary text-primary-foreground border-0"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editing ? "Save changes" : "Log waste"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
