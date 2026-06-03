import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { prodTone } from "@/lib/production-mock";
import { usePermissions } from "@/hooks/rbac/use-permissions";
import {
  useCreateProductionQualityInspection,
  useProductionProductSkus,
  useProductionQualityInspections,
  useProductionWorkOrders,
  useUpdateProductionQualityInspection,
} from "@/hooks/production/use-production";
import type {
  ProductionQualityInspectionDto,
  UpdateProductionQualityInspectionInput,
} from "@/modules/production/types";

const QC_RESULTS = ["pass", "fail", "rework"] as const;

type InspectionFormState = {
  reference: string;
  product_sku: string;
  product_name: string;
  batch_number: string;
  production_work_order_id: string;
  inspector_name: string;
  inspected_at: string;
  defects_count: string;
  sample_size: string;
  result: (typeof QC_RESULTS)[number];
  notes: string;
};

function emptyForm(): InspectionFormState {
  return {
    reference: "",
    product_sku: "",
    product_name: "",
    batch_number: "",
    production_work_order_id: "",
    inspector_name: "",
    inspected_at: new Date().toISOString().slice(0, 10),
    defects_count: "0",
    sample_size: "",
    result: "pass",
    notes: "",
  };
}

function formFromInspection(q: ProductionQualityInspectionDto): InspectionFormState {
  return {
    reference: q.reference ?? q.ref,
    product_sku: q.product_sku ?? "",
    product_name: q.product_name ?? q.product,
    batch_number: q.batch_number ?? q.batch ?? "",
    production_work_order_id: q.production_work_order_id ? String(q.production_work_order_id) : "",
    inspector_name: q.inspector_name ?? q.inspector ?? "",
    inspected_at: q.inspected_at ?? q.date ?? new Date().toISOString().slice(0, 10),
    defects_count: String(q.defects_count ?? q.defects ?? 0),
    sample_size: q.sample_size != null ? String(q.sample_size) : "",
    result: (QC_RESULTS.includes(q.result as (typeof QC_RESULTS)[number])
      ? q.result
      : "pass") as InspectionFormState["result"],
    notes: q.notes ?? "",
  };
}

function toPayload(form: InspectionFormState): UpdateProductionQualityInspectionInput {
  return {
    reference: form.reference.trim() || undefined,
    product_sku: form.product_sku.trim() || undefined,
    product_name: form.product_name.trim() || undefined,
    batch_number: form.batch_number.trim() || undefined,
    production_work_order_id: form.production_work_order_id
      ? Number(form.production_work_order_id)
      : undefined,
    inspector_name: form.inspector_name.trim() || undefined,
    inspected_at: form.inspected_at || undefined,
    defects_count: Number(form.defects_count) || 0,
    sample_size: form.sample_size ? Number(form.sample_size) : undefined,
    result: form.result,
    notes: form.notes.trim() || undefined,
  };
}

export function QualityPage() {
  const { can } = usePermissions();
  const canManage = can("production.boms.manage");

  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<ProductionQualityInspectionDto | null>(null);
  const [form, setForm] = useState<InspectionFormState>(emptyForm);

  const listParams = useMemo(
    () => ({
      per_page: 100,
      search: search.trim() || undefined,
      result: resultFilter === "all" ? undefined : resultFilter,
    }),
    [search, resultFilter],
  );

  const { data, isLoading, isError, refetch, isFetching } = useProductionQualityInspections(listParams);
  const { data: skuData } = useProductionProductSkus({ per_page: 100, purpose: "finished" });
  const { data: woData } = useProductionWorkOrders({ per_page: 100 });
  const createInspection = useCreateProductionQualityInspection();
  const updateInspection = useUpdateProductionQualityInspection();

  const inspections = data?.data ?? [];
  const summary = data?.summary;

  const skuOptions = useMemo(
    () =>
      (skuData?.data ?? []).map((p) => ({
        value: p.sku,
        label: `${p.sku} — ${p.name}`,
        keywords: `${p.sku} ${p.name}`,
      })),
    [skuData],
  );

  const woOptions = useMemo(
    () =>
      (woData?.data ?? []).map((wo) => ({
        value: String(wo.id),
        label: `${wo.number} — ${wo.status}`,
        keywords: wo.number,
      })),
    [woData],
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setSheetOpen(true);
  };

  const openEdit = (q: ProductionQualityInspectionDto) => {
    setEditing(q);
    setForm(formFromInspection(q));
    setSheetOpen(true);
  };

  const onSkuChange = (sku: string) => {
    const match = skuData?.data?.find((p) => p.sku === sku);
    setForm((f) => ({
      ...f,
      product_sku: sku,
      product_name: match?.name ?? f.product_name,
    }));
  };

  const handleSubmit = async () => {
    if (!form.product_name.trim() && !form.product_sku.trim()) return;
    const body = toPayload(form);
    if (!body.product_name && body.product_sku) {
      const match = skuData?.data?.find((p) => p.sku === body.product_sku);
      if (match) body.product_name = match.name;
    }
    if (!body.product_name) return;

    if (editing) {
      await updateInspection.mutateAsync({ id: editing.id, body });
    } else {
      await createInspection.mutateAsync(body);
    }
    setSheetOpen(false);
  };

  const saving = createInspection.isPending || updateInspection.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quality Control"
        description="Inspections, defects and rework tracking."
        breadcrumbs={[{ label: "Production" }, { label: "Quality" }]}
        actions={
          canManage ? (
            <Button size="sm" className="gradient-primary text-primary-foreground border-0" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              New inspection
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search ref, product, batch, inspector…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={resultFilter} onValueChange={setResultFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Result" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All results</SelectItem>
            {QC_RESULTS.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh">
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Pass rate" value={`${summary?.pass_rate ?? 0}%`} icon={ShieldCheck} />
        <StatCard label="Inspections" value={String(summary?.total ?? inspections.length)} icon={CheckCircle2} />
        <StatCard label="Rework" value={String(summary?.rework_count ?? 0)} icon={AlertTriangle} />
        <StatCard label="Failed" value={String(summary?.fail_count ?? 0)} icon={XCircle} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent quality checks</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="p-6">
              <EmptyState
                title="Could not load inspections"
                description="Check production module access and retry."
                action={
                  <Button variant="outline" onClick={() => refetch()}>
                    Retry
                  </Button>
                }
              />
            </div>
          ) : inspections.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={ShieldCheck}
                title="No inspections yet"
                description="Record pass, fail, or rework outcomes for production batches."
                action={
                  canManage ? (
                    <Button onClick={openCreate}>
                      <Plus className="h-4 w-4 mr-2" />
                      New inspection
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
                  <TableHead>Product</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Work order</TableHead>
                  <TableHead>Inspector</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Defects</TableHead>
                  <TableHead>Result</TableHead>
                  {canManage && <TableHead className="w-10" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {inspections.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-mono text-xs">{q.ref ?? q.reference}</TableCell>
                    <TableCell className="font-medium">{q.product ?? q.product_name}</TableCell>
                    <TableCell className="font-mono text-xs">{q.batch ?? q.batch_number ?? "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {q.work_order_number ?? (q.production_work_order_id ? `#${q.production_work_order_id}` : "—")}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {q.inspector ?? q.inspector_name ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm">{q.date ?? q.inspected_at}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{q.defects ?? q.defects_count}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={prodTone(q.result)}>
                        {q.result}
                      </Badge>
                    </TableCell>
                    {canManage && (
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(q)} aria-label="Edit inspection">
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

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{editing ? "Edit inspection" : "New inspection"}</SheetTitle>
            <SheetDescription>
              Record production QC outcomes. Optional work order link ties inspection to a specific run. Fail/rework does
              not auto-adjust stock (use inventory adjustments or waste when implemented).
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="qc-ref">Reference</Label>
              <Input
                id="qc-ref"
                placeholder="QC-0421 (auto if empty)"
                value={form.reference}
                onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Product (SKU)</Label>
              <SearchableSelect
                value={form.product_sku}
                onValueChange={onSkuChange}
                options={skuOptions}
                placeholder="Select finished SKU…"
                searchPlaceholder="Search SKU…"
                inOverlay
                modal={false}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qc-product-name">Product name *</Label>
              <Input
                id="qc-product-name"
                value={form.product_name}
                onChange={(e) => setForm((f) => ({ ...f, product_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qc-batch">Batch</Label>
              <Input
                id="qc-batch"
                value={form.batch_number}
                onChange={(e) => setForm((f) => ({ ...f, batch_number: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Work order (optional)</Label>
              <SearchableSelect
                value={form.production_work_order_id}
                onValueChange={(v) => setForm((f) => ({ ...f, production_work_order_id: v }))}
                options={[{ value: "", label: "None" }, ...woOptions]}
                placeholder="Link to work order…"
                inOverlay
                modal={false}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qc-inspector">Inspector</Label>
              <Input
                id="qc-inspector"
                value={form.inspector_name}
                onChange={(e) => setForm((f) => ({ ...f, inspector_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qc-date">Inspection date</Label>
              <Input
                id="qc-date"
                type="date"
                value={form.inspected_at}
                onChange={(e) => setForm((f) => ({ ...f, inspected_at: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="qc-defects">Defects</Label>
                <Input
                  id="qc-defects"
                  type="number"
                  min={0}
                  value={form.defects_count}
                  onChange={(e) => setForm((f) => ({ ...f, defects_count: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qc-sample">Sample size</Label>
                <Input
                  id="qc-sample"
                  type="number"
                  min={0}
                  value={form.sample_size}
                  onChange={(e) => setForm((f) => ({ ...f, sample_size: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Result *</Label>
              <Select
                value={form.result}
                onValueChange={(v) => setForm((f) => ({ ...f, result: v as InspectionFormState["result"] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QC_RESULTS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="qc-notes">Notes</Label>
              <Input
                id="qc-notes"
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
              disabled={saving || (!form.product_name.trim() && !form.product_sku.trim())}
              className="gradient-primary text-primary-foreground border-0"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editing ? "Save changes" : "Record inspection"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
