import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertCircle, GitBranch, ListChecks, MoreHorizontal, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkuPicker } from "@/shared/components/forms/sku-picker";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaginationBar } from "@/modules/finance/components/pagination-bar";
import { usePermissions } from "@/hooks/rbac/use-permissions";
import {
  useCreateProductionBom,
  useProductionBom,
  useProductionBoms,
  useProductionMaterialAvailability,
  useUpdateProductionBom,
} from "@/hooks/production/use-production";
import type { CreateProductionBomInput, ProductionBomDto } from "@/modules/production/types";
import { toast } from "sonner";

type BomLineForm = {
  /** Stable React key — must not change when SKU is edited. */
  lineId: number;
  sku: string;
  qty_per_batch: number;
  wastage_pct: number;
  unit_cost: number;
};

let bomLineIdSeq = 0;

function createBomLine(
  partial?: Partial<Pick<BomLineForm, "sku" | "qty_per_batch" | "wastage_pct" | "unit_cost">>,
): BomLineForm {
  bomLineIdSeq += 1;

  return {
    lineId: bomLineIdSeq,
    sku: "",
    qty_per_batch: 1,
    wastage_pct: 0,
    unit_cost: 0,
    ...partial,
  };
}

function tone(status: string) {
  if (status === "active") return "bg-success/15 text-success border-success/30";
  return "bg-muted text-muted-foreground border-border";
}

function formatMoney(value: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(value);
}

function batchCost(lines: ProductionBomDto["lines"]) {
  return lines.reduce((sum, line) => sum + Number(line.qty_per_batch) * Number(line.unit_cost), 0);
}

export function BomPage() {
  const { can } = usePermissions();
  const canManage = can("production.boms.manage");

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editing, setEditing] = useState<ProductionBomDto | null>(null);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [batchSize, setBatchSize] = useState("1");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [lines, setLines] = useState<BomLineForm[]>(() => [createBomLine()]);

  const listParams = useMemo(
    () => ({
      page,
      per_page: 20,
      search: search || undefined,
      status: statusFilter || undefined,
    }),
    [page, search, statusFilter],
  );

  const { data, isLoading, isError, isFetching } = useProductionBoms(listParams);
  const boms = data?.data ?? [];
  const pagination = data?.pagination;

  const { data: selectedDetail } = useProductionBom(selectedId);
  const selected = selectedDetail ?? boms.find((b) => b.id === selectedId) ?? boms[0] ?? null;

  const { data: rmAvailability } = useProductionMaterialAvailability(selected?.id ?? null);

  const createBom = useCreateProductionBom();
  const updateBom = useUpdateProductionBom();

  useEffect(() => {
    if (!selectedId && boms[0]) {
      setSelectedId(boms[0].id);
    }
  }, [boms, selectedId]);

  function resetForm() {
    setEditing(null);
    setName("");
    setSku("");
    setBatchSize("1");
    setNotes("");
    setStatus("active");
    setLines([createBomLine()]);
  }

  function openForEdit(bom: ProductionBomDto) {
    setEditing(bom);
    setName(bom.name);
    setSku(bom.sku ?? "");
    setBatchSize(String(bom.batch_size || 1));
    setNotes(bom.notes ?? "");
    setStatus(bom.status === "inactive" ? "inactive" : "active");
    setLines(
      bom.lines.length
        ? bom.lines.map((line) =>
            createBomLine({
              sku: line.sku,
              qty_per_batch: line.qty_per_batch,
              wastage_pct: line.wastage_pct,
              unit_cost: line.unit_cost,
            }),
          )
        : [createBomLine()],
    );
    setOpen(true);
  }

  function submitBom() {
    if (!canManage) {
      toast.error("You do not have permission to manage BOMs");
      return;
    }
    if (!name.trim()) {
      toast.error("BOM name is required");
      return;
    }

    const cleaned = lines.filter((line) => line.sku.trim() && line.qty_per_batch > 0);
    if (!cleaned.length) {
      toast.error("At least one raw material line is required");
      return;
    }

    const payload: CreateProductionBomInput = {
      name: name.trim(),
      sku: sku.trim() || undefined,
      status,
      batch_size: Number(batchSize || 1),
      notes: notes.trim() || undefined,
      lines: cleaned.map((line) => ({
        sku: line.sku.trim(),
        qty_per_batch: Number(line.qty_per_batch),
        wastage_pct: Number(line.wastage_pct || 0),
        unit_cost: Number(line.unit_cost || 0),
      })),
    };

    if (editing) {
      updateBom.mutate(
        { id: editing.id, body: payload },
        {
          onSuccess: (res) => {
            setOpen(false);
            resetForm();
            if (res.data?.id) setSelectedId(res.data.id);
          },
        },
      );
      return;
    }

    createBom.mutate(payload, {
      onSuccess: (res) => {
        setOpen(false);
        resetForm();
        if (res.data?.id) setSelectedId(res.data.id);
      },
    });
  }

  const applySearch = () => {
    setSearch(searchInput.trim());
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bill of Materials"
        description="Component recipes linked to product master and inventory availability."
        breadcrumbs={[{ label: "Production" }, { label: "BOM" }]}
        actions={
          canManage ? (
            <Sheet
              open={open}
              onOpenChange={(value) => {
                setOpen(value);
                if (!value) resetForm();
              }}
            >
              <SheetTrigger asChild>
                <Button size="sm" className="gradient-primary text-primary-foreground border-0">
                  <Plus className="h-4 w-4 mr-2" />
                  New BOM
                </Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>{editing ? "Edit BOM" : "Create Bill of Materials"}</SheetTitle>
                </SheetHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Table BOM"
                      />
                    </div>
                    <div>
                      <Label>Finished product (SKU)</Label>
                      <SkuPicker
                        registry="production"
                        purpose="finished"
                        inOverlay
                        value={sku}
                        onValueChange={setSku}
                        placeholder="Search output SKU…"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Batch size</Label>
                      <Input
                        type="number"
                        min={0.001}
                        step="0.001"
                        value={batchSize}
                        onChange={(e) => setBatchSize(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Status</Label>
                      <div className="mt-2 flex gap-2">
                        <Button
                          type="button"
                          variant={status === "active" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setStatus("active")}
                        >
                          Active
                        </Button>
                        <Button
                          type="button"
                          variant={status === "inactive" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setStatus("inactive")}
                        >
                          Inactive
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" />
                  </div>
                  <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
                    <div className="flex items-center justify-between">
                      <Label>Raw materials</Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setLines((prev) => [...prev, createBomLine()])}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add line
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Pick a material SKU from the product master; unit cost fills when you select a row.
                    </p>
                    <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground">
                      <span className="col-span-5">Material SKU</span>
                      <span className="col-span-2">Qty / batch</span>
                      <span className="col-span-2">Wastage %</span>
                      <span className="col-span-2">Unit cost</span>
                      <span className="col-span-1 sr-only">Remove</span>
                    </div>
                    {lines.map((line, idx) => (
                      <div key={line.lineId} className="grid grid-cols-12 gap-2 items-center">
                        <SkuPicker
                          className="col-span-5"
                          registry="production"
                          purpose="component"
                          inOverlay
                          value={line.sku}
                          onValueChange={(next) =>
                            setLines((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, sku: next } : item)),
                            )
                          }
                          onSkuSelect={(row) => {
                            if (row) {
                              setLines((prev) =>
                                prev.map((item, i) =>
                                  i === idx
                                    ? { ...item, sku: row.sku, unit_cost: Number(row.cost_price ?? 0) }
                                    : item,
                                ),
                              );
                            }
                          }}
                          placeholder="Material SKU…"
                        />
                        <Input
                          className="col-span-2"
                          type="number"
                          min={0.001}
                          step="0.001"
                          aria-label="Qty per batch"
                          value={line.qty_per_batch}
                          onChange={(e) =>
                            setLines((prev) =>
                              prev.map((item, i) =>
                                i === idx
                                  ? { ...item, qty_per_batch: Number(e.target.value || 0) }
                                  : item,
                              ),
                            )
                          }
                        />
                        <Input
                          className="col-span-2"
                          type="number"
                          min={0}
                          step="0.01"
                          aria-label="Wastage percent"
                          value={line.wastage_pct}
                          onChange={(e) =>
                            setLines((prev) =>
                              prev.map((item, i) =>
                                i === idx
                                  ? { ...item, wastage_pct: Number(e.target.value || 0) }
                                  : item,
                              ),
                            )
                          }
                        />
                        <Input
                          className="col-span-2"
                          type="number"
                          min={0}
                          step="0.0001"
                          aria-label="Unit cost"
                          value={line.unit_cost}
                          onChange={(e) =>
                            setLines((prev) =>
                              prev.map((item, i) =>
                                i === idx
                                  ? { ...item, unit_cost: Number(e.target.value || 0) }
                                  : item,
                              ),
                            )
                          }
                        />
                        <Button
                          type="button"
                          className="col-span-1"
                          variant="ghost"
                          aria-label="Remove line"
                          onClick={() => setLines((prev) => prev.filter((_, i) => i !== idx))}
                          disabled={lines.length === 1}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <SheetFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={submitBom} disabled={createBom.isPending || updateBom.isPending}>
                    {editing ? "Update" : "Save"}
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          ) : null
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applySearch()}
              placeholder="Search name, code, SKU…"
            />
          </div>
          <Button variant="secondary" onClick={applySearch}>
            Search
          </Button>
          <Select
            value={statusFilter || "all"}
            onValueChange={(v) => {
              setStatusFilter(v === "all" ? "" : v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Failed to load BOMs. Check production module access and try again.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>BOM list</CardTitle>
            {isFetching && !isLoading && (
              <span className="text-xs text-muted-foreground">Refreshing…</span>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-sm text-muted-foreground">Loading BOMs…</div>
            ) : boms.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={ListChecks}
                  title="No BOM found"
                  description="Create BOM recipes with raw material SKUs from your product master."
                />
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Finished product</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Est. cost / batch</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {boms.map((bom) => (
                      <TableRow
                        key={bom.id}
                        className={`cursor-pointer ${selected?.id === bom.id ? "bg-muted/50" : ""}`}
                        onClick={() => setSelectedId(bom.id)}
                      >
                        <TableCell className="font-mono text-xs">
                          {bom.code ?? `BOM-${bom.id}`}
                        </TableCell>
                        <TableCell className="font-medium">{bom.name}</TableCell>
                        <TableCell>{bom.sku ?? "-"}</TableCell>
                        <TableCell>{bom.lines.length}</TableCell>
                        <TableCell>{formatMoney(batchCost(bom.lines))}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={tone(bom.status)}>
                            {bom.status}
                          </Badge>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          {canManage && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openForEdit(bom)}>
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateBom.mutate({
                                      id: bom.id,
                                      body: {
                                        status: bom.status === "active" ? "inactive" : "active",
                                      },
                                    })
                                  }
                                >
                                  {bom.status === "active" ? "Deactivate" : "Activate"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {pagination && pagination.lastPage > 1 && (
                  <div className="border-t p-3">
                    <PaginationBar
                      page={pagination.page}
                      lastPage={pagination.lastPage}
                      total={pagination.total}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">{selected?.code ?? "BOM detail"}</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">
              {selected
                ? `${selected.name} · batch ${selected.batch_size}${selected.product_name ? ` · ${selected.product_name}` : ""}`
                : "Select a BOM from the list"}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selected ? (
              <div className="text-sm text-muted-foreground">No BOM selected.</div>
            ) : (
              <>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Raw materials
                  </p>
                  {selected.lines.map((line) => (
                    <div
                      key={line.id}
                      className="flex items-center justify-between rounded-lg border p-2.5 text-sm"
                    >
                      <div>
                        <div className="font-medium">{line.product_name ?? line.sku}</div>
                        <div className="text-xs text-muted-foreground font-mono">{line.sku}</div>
                        <div className="text-xs text-muted-foreground">
                          {line.qty_per_batch} / batch · wastage {line.wastage_pct}%
                        </div>
                      </div>
                      <div className="text-right font-mono text-xs">
                        {formatMoney(Number(line.unit_cost))}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between border-t pt-3 text-sm font-semibold">
                    <span>Batch cost</span>
                    <span>{formatMoney(batchCost(selected.lines))}</span>
                  </div>
                </div>

                {(rmAvailability?.lines?.length ?? 0) > 0 && (
                  <div className="space-y-2 border-t pt-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Inventory (per batch)
                    </p>
                    {rmAvailability!.lines.map((row) => (
                      <div
                        key={row.sku}
                        className="flex items-center justify-between rounded-md border px-2 py-1.5 text-xs"
                      >
                        <span className="font-mono">{row.sku}</span>
                        <span
                          className={
                            row.sufficient_for_one_batch ? "text-success" : "text-destructive"
                          }
                        >
                          {row.available_qty} avail
                          {row.sufficient_for_one_batch ? " ✓" : " · short"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {canManage && selected.status === "active" && (
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to="/app/prod/work-orders">Create work order from BOM</Link>
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
