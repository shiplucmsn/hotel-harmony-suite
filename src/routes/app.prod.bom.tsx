import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkuPicker } from "@/shared/components/forms/sku-picker";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Plus, MoreHorizontal, Download, GitBranch, ListChecks } from "lucide-react";
import { toast } from "sonner";
import {
  useCreateProductionBom,
  useProductionBoms,
  useUpdateProductionBom,
} from "@/hooks/production/use-production";
import type { CreateProductionBomInput, ProductionBomDto } from "@/modules/production/types";

export const Route = createFileRoute("/app/prod/bom")({ component: BOMPage });

type BomLineForm = {
  sku: string;
  qty_per_batch: number;
  wastage_pct: number;
  unit_cost: number;
};

function tone(status: string) {
  if (status === "active") return "bg-success/15 text-success border-success/30";
  return "bg-muted text-muted-foreground border-border";
}

function BOMPage() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editing, setEditing] = useState<ProductionBomDto | null>(null);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [batchSize, setBatchSize] = useState("1");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [lines, setLines] = useState<BomLineForm[]>([{ sku: "", qty_per_batch: 1, wastage_pct: 0, unit_cost: 0 }]);

  const { data, isLoading } = useProductionBoms({ per_page: 200, search: q || undefined });
  const createBom = useCreateProductionBom();
  const updateBom = useUpdateProductionBom();
  const boms = data?.data ?? [];

  const filtered = useMemo(
    () =>
      boms.filter(
        (bom) =>
          bom.name.toLowerCase().includes(q.toLowerCase()) ||
          bom.code?.toLowerCase().includes(q.toLowerCase()) ||
          bom.sku?.toLowerCase().includes(q.toLowerCase()),
      ),
    [boms, q],
  );
  const selected = filtered.find((bom) => bom.id === selectedId) ?? filtered[0] ?? null;

  function resetForm() {
    setEditing(null);
    setName("");
    setSku("");
    setBatchSize("1");
    setStatus("active");
    setLines([{ sku: "", qty_per_batch: 1, wastage_pct: 0, unit_cost: 0 }]);
  }

  function openForEdit(bom: ProductionBomDto) {
    setEditing(bom);
    setName(bom.name);
    setSku(bom.sku ?? "");
    setBatchSize(String(bom.batch_size || 1));
    setStatus(bom.status === "inactive" ? "inactive" : "active");
    setLines(
      bom.lines.length
        ? bom.lines.map((line) => ({
            sku: line.sku,
            qty_per_batch: line.qty_per_batch,
            wastage_pct: line.wastage_pct,
            unit_cost: line.unit_cost,
          }))
        : [{ sku: "", qty_per_batch: 1, wastage_pct: 0, unit_cost: 0 }],
    );
    setOpen(true);
  }

  function submitBom() {
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
          onSuccess: () => {
            setOpen(false);
            resetForm();
          },
        },
      );
      return;
    }

    createBom.mutate(payload, {
      onSuccess: () => {
        setOpen(false);
        resetForm();
      },
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bill of Materials"
        description="Component recipes that drive every production run."
        breadcrumbs={[{ label: "Production" }, { label: "BOM" }]}
        actions={
          <>
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
            <Sheet open={open} onOpenChange={(value) => { setOpen(value); if (!value) resetForm(); }}>
              <SheetTrigger asChild>
                <Button size="sm" className="gradient-primary text-primary-foreground border-0">
                  <Plus className="h-4 w-4 mr-2" />New BOM
                </Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-lg overflow-y-auto">
                <SheetHeader><SheetTitle>{editing ? "Edit BOM" : "Create Bill of Materials"}</SheetTitle></SheetHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Name</Label><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Table BOM" /></div>
                    <div>
                      <Label>Output SKU</Label>
                      <SkuPicker value={sku} onValueChange={setSku} placeholder="Search output SKU…" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Batch size</Label><Input type="number" min={0.001} step="0.001" value={batchSize} onChange={(event) => setBatchSize(event.target.value)} /></div>
                    <div>
                      <Label>Status</Label>
                      <div className="mt-2 flex gap-2">
                        <Button type="button" variant={status === "active" ? "default" : "outline"} size="sm" onClick={() => setStatus("active")}>Active</Button>
                        <Button type="button" variant={status === "inactive" ? "default" : "outline"} size="sm" onClick={() => setStatus("inactive")}>Inactive</Button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
                    <div className="flex items-center justify-between">
                      <Label>Raw materials</Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setLines((prev) => [...prev, { sku: "", qty_per_batch: 1, wastage_pct: 0, unit_cost: 0 }])
                        }
                      >
                        <Plus className="h-4 w-4 mr-1" />Add line
                      </Button>
                    </div>
                    {lines.map((line, idx) => (
                      <div key={`${idx}-${line.sku}`} className="grid grid-cols-12 gap-2">
                        <SkuPicker
                          className="col-span-5"
                          value={line.sku}
                          onValueChange={(next) =>
                            setLines((prev) => prev.map((item, i) => (i === idx ? { ...item, sku: next } : item)))
                          }
                          onSkuSelect={(row) => {
                            if (row) {
                              setLines((prev) =>
                                prev.map((item, i) =>
                                  i === idx ? { ...item, sku: row.sku, unit_cost: Number(row.cost_price ?? 0) } : item,
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
                          value={line.qty_per_batch}
                          onChange={(event) =>
                            setLines((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, qty_per_batch: Number(event.target.value || 0) } : item)),
                            )
                          }
                        />
                        <Input
                          className="col-span-2"
                          type="number"
                          min={0}
                          step="0.01"
                          value={line.wastage_pct}
                          onChange={(event) =>
                            setLines((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, wastage_pct: Number(event.target.value || 0) } : item)),
                            )
                          }
                        />
                        <Input
                          className="col-span-2"
                          type="number"
                          min={0}
                          step="0.0001"
                          value={line.unit_cost}
                          onChange={(event) =>
                            setLines((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, unit_cost: Number(event.target.value || 0) } : item)),
                            )
                          }
                        />
                        <Button
                          type="button"
                          className="col-span-1"
                          variant="ghost"
                          onClick={() => setLines((prev) => prev.filter((_, i) => i !== idx))}
                          disabled={lines.length === 1}
                        >
                          x
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <SheetFooter>
                  <Button variant="outline" onClick={() => { setOpen(false); resetForm(); }}>Cancel</Button>
                  <Button onClick={submitBom} disabled={createBom.isPending || updateBom.isPending}>
                    {editing ? "Update" : "Save"}
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </>
        }
      />

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" value={q} onChange={e => setQ(e.target.value)} placeholder="Search BOM..." />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>BOM list</CardTitle></CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-sm text-muted-foreground">Loading BOMs...</div>
            ) : filtered.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={ListChecks}
                  title="No BOM found"
                  description="Create BOM recipes to prepare work orders and production planning."
                />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Output SKU</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Est. Cost</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((bom) => {
                    const estCost = bom.lines.reduce((sum, line) => sum + Number(line.qty_per_batch) * Number(line.unit_cost), 0);
                    return (
                      <TableRow key={bom.id} className="cursor-pointer" onClick={() => setSelectedId(bom.id)}>
                        <TableCell className="font-mono text-xs">{bom.code ?? `BOM-${bom.id}`}</TableCell>
                        <TableCell className="font-medium">{bom.name}</TableCell>
                        <TableCell>{bom.sku ?? "-"}</TableCell>
                        <TableCell>{bom.lines.length}</TableCell>
                        <TableCell>${estCost.toFixed(2)}</TableCell>
                        <TableCell><Badge variant="outline" className={tone(bom.status)}>{bom.status}</Badge></TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openForEdit(bom)}>Edit</DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  updateBom.mutate({ id: bom.id, body: { status: bom.status === "active" ? "inactive" : "active" } })
                                }
                              >
                                {bom.status === "active" ? "Deactivate" : "Activate"}
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

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">{selected?.code ?? "No BOM selected"}</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">{selected ? `${selected.name} · batch ${selected.batch_size}` : "Select a BOM"}</p>
          </CardHeader>
          <CardContent>
            {!selected ? (
              <div className="text-sm text-muted-foreground">No BOM data available.</div>
            ) : (
              <div className="space-y-2">
                {selected.lines.map((line) => (
                  <div key={line.id} className="flex items-center justify-between rounded-lg border p-2.5 text-sm">
                    <div>
                      <div className="font-medium">{line.product_name ?? line.sku}</div>
                      <div className="text-xs text-muted-foreground">
                        {line.qty_per_batch} per batch · wastage {line.wastage_pct}%
                      </div>
                    </div>
                    <div className="font-mono text-xs">${Number(line.unit_cost).toFixed(4)}</div>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t pt-3 text-sm font-semibold">
                  <span>Total batch cost</span>
                  <span>${selected.lines.reduce((sum, line) => sum + Number(line.qty_per_batch) * Number(line.unit_cost), 0).toFixed(2)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
