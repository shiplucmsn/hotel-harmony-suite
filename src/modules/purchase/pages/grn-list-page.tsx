import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, PackageCheck, Plus, Trash2, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { SkuPicker } from "@/shared/components/forms/sku-picker";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { PaginationBar } from "@/modules/finance/components/pagination-bar";
import { SupplierSelect } from "@/modules/purchase/components/supplier-select";
import { useCreateGrn, usePurchaseGrns } from "@/hooks/purchase/use-purchase";
import { useInventoryWarehouses } from "@/hooks/inventory/use-inventory-warehouses";
import { formatMoney, purchaseStatusTone } from "@/modules/purchase/utils";
import type { PurchaseGrnDto } from "@/modules/purchase/types";

type GrnLine = { sku: string; qty: number; cost: number; batch?: string; expiry?: string };

type GrnListPageProps = {
  initialSupplierId?: number;
  openNew?: boolean;
};

function grnSupplierName(g: PurchaseGrnDto): string {
  return g.supplier?.name ?? (g.supplier_id ? `Supplier #${g.supplier_id}` : "—");
}

function grnLineSummary(g: PurchaseGrnDto): string {
  if (g.lines?.length) {
    const qty = g.lines.reduce((s, l) => s + l.quantity, 0);
    return `${g.lines.length} SKU · ${qty} units`;
  }
  if (g.sku) return `${g.sku} × ${g.quantity ?? 0}`;
  return "—";
}

export function GrnListPage({ initialSupplierId, openNew }: GrnListPageProps) {
  const [open, setOpen] = useState(openNew ?? false);
  const [page, setPage] = useState(1);
  const [supplierFilter, setSupplierFilter] = useState(
    initialSupplierId ? String(initialSupplierId) : "",
  );
  const [supplierId, setSupplierId] = useState(
    initialSupplierId ? String(initialSupplierId) : "",
  );
  const [warehouseId, setWarehouseId] = useState("");
  const [poId, setPoId] = useState("");
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState<GrnLine[]>([{ sku: "", qty: 1, cost: 0, batch: "", expiry: "" }]);
  const [updateProductCost, setUpdateProductCost] = useState(false);
  const [requiresQc, setRequiresQc] = useState(false);
  const [freightCost, setFreightCost] = useState("");
  const [dutyCost, setDutyCost] = useState("");
  const [headerTax, setHeaderTax] = useState("");
  const [notes, setNotes] = useState("");

  const [poFilter, setPoFilter] = useState("");

  // Derived totals — live as user types
  const subtotal = items.reduce((acc, line) => acc + line.qty * line.cost, 0);
  const grandTotal =
    subtotal + Number(freightCost || 0) + Number(dutyCost || 0) + Number(headerTax || 0);

  const listParams = useMemo(
    () => ({
      page,
      per_page: 20,
      supplier_id: supplierFilter ? Number(supplierFilter) : undefined,
      purchase_order_id: poFilter ? Number(poFilter) : undefined,
    }),
    [page, supplierFilter, poFilter],
  );

  const { data, isLoading, isFetching } = usePurchaseGrns(listParams);
  const grns = data?.data ?? [];
  const pagination = data?.pagination;
  const { data: warehousesRes } = useInventoryWarehouses();
  const warehouses = warehousesRes?.data ?? [];
  const createGrn = useCreateGrn();

  const resetForm = () => {
    setItems([{ sku: "", qty: 1, cost: 0, batch: "", expiry: "" }]);
    setPoId("");
    setFreightCost("");
    setDutyCost("");
    setHeaderTax("");
    setNotes("");
    setRequiresQc(false);
    setUpdateProductCost(false);
  };

  const submit = async () => {
    const lines = items.filter((i) => i.sku && i.qty > 0);
    if (lines.length === 0) return;

    const landed_costs = [];
    const freight = Number(freightCost);
    const duty = Number(dutyCost);
    if (freight > 0)
      landed_costs.push({ cost_type: "freight" as const, amount: freight, allocation_method: "qty" as const });
    if (duty > 0)
      landed_costs.push({ cost_type: "duty" as const, amount: duty, allocation_method: "value" as const });

    await createGrn.mutateAsync({
      supplier_id: supplierId ? Number(supplierId) : undefined,
      warehouse_id: warehouseId ? Number(warehouseId) : undefined,
      purchase_order_id: poId ? Number(poId) : undefined,
      received_date: receivedDate,
      tax_amount: headerTax ? Number(headerTax) : undefined,
      notes: notes.trim() || undefined,
      lines: lines.map((l) => ({
        sku: l.sku,
        quantity: l.qty,
        unit_cost: l.cost,
        batch_number: l.batch?.trim() || undefined,
        expiry_date: l.expiry || undefined,
      })),
      landed_costs: landed_costs.length ? landed_costs : undefined,
      update_product_cost: updateProductCost,
      requires_qc: requiresQc,
    });
    setOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Goods Receive Notes (GRN)"
        description="Record incoming shipments from suppliers. Posting increases warehouse stock and accounts payable."
        breadcrumbs={[{ label: "Purchases" }, { label: "GRN" }]}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link to="/app/inv/suppliers">Suppliers</Link>
            </Button>

            <Sheet
              open={open}
              onOpenChange={(v) => {
                setOpen(v);
                if (!v) resetForm();
              }}
            >
              <Button
                size="sm"
                className="gradient-primary border-0 text-primary-foreground"
                onClick={() => setOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                New GRN
              </Button>

              <SheetContent className="flex flex-col overflow-y-auto sm:max-w-3xl">
                <SheetHeader className="pb-2">
                  <SheetTitle>Post goods receipt</SheetTitle>
                </SheetHeader>

                <div className="flex-1 space-y-5 py-2">
                  {/* ── Supplier + Warehouse ── */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>
                        Supplier <span className="text-destructive">*</span>
                      </Label>
                      <SupplierSelect value={supplierId} onValueChange={setSupplierId} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>
                        Warehouse <span className="text-destructive">*</span>
                      </Label>
                      <Select value={warehouseId} onValueChange={setWarehouseId}>
                        <SelectTrigger id="grn-warehouse">
                          <SelectValue placeholder="Select warehouse…" />
                        </SelectTrigger>
                        <SelectContent>
                          {warehouses.map((w) => (
                            <SelectItem key={w.id} value={String(w.id)}>
                              {w.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* ── PO ID + Date ── */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="grn-po">PO ID (optional)</Label>
                      <Input
                        id="grn-po"
                        type="number"
                        placeholder="Link to Purchase Order #"
                        value={poId}
                        onChange={(e) => setPoId(e.target.value)}
                      />
                      {poId && (
                        <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <AlertCircle className="h-3 w-3" />
                          Linked to PO #{poId} — qty capped by remaining ordered lines
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="grn-date">Received date</Label>
                      <Input
                        id="grn-date"
                        type="date"
                        value={receivedDate}
                        onChange={(e) => setReceivedDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* ── Receipt Lines ── */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Receipt Lines</Label>
                      <span className="text-xs text-muted-foreground">
                        {items.filter((i) => i.sku && i.qty > 0).length} active line(s)
                      </span>
                    </div>

                    {/* Column headers */}
                    <div className="grid grid-cols-[2fr_70px_90px_80px_90px_120px_32px] gap-2 rounded-md bg-muted/50 px-2 py-1.5 text-xs font-medium text-muted-foreground">
                      <span>Product (SKU)</span>
                      <span>Qty</span>
                      <span>Unit cost</span>
                      <span className="text-right">Line total</span>
                      <span>Lot/batch</span>
                      <span>Expiry date</span>
                      <span />
                    </div>

                    <div className="space-y-1.5">
                      {items.map((line, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-[2fr_70px_90px_80px_90px_120px_32px] items-center gap-2"
                        >
                          <SkuPicker
                            value={line.sku}
                            onValueChange={(sku) => {
                              const next = [...items];
                              next[idx] = { ...next[idx], sku };
                              setItems(next);
                            }}
                            placeholder="SKU"
                          />
                          <Input
                            type="number"
                            min={0}
                            step="any"
                            aria-label={`Line ${idx + 1} quantity`}
                            value={line.qty || ""}
                            onChange={(e) => {
                              const next = [...items];
                              next[idx] = { ...next[idx], qty: Number(e.target.value) };
                              setItems(next);
                            }}
                          />
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            aria-label={`Line ${idx + 1} unit cost`}
                            value={line.cost || ""}
                            onChange={(e) => {
                              const next = [...items];
                              next[idx] = { ...next[idx], cost: Number(e.target.value) };
                              setItems(next);
                            }}
                          />
                          {/* Live line total */}
                          <div className="pr-1 text-right text-sm font-medium tabular-nums">
                            {formatMoney(line.qty * line.cost)}
                          </div>
                          <Input
                            placeholder="Lot"
                            aria-label={`Line ${idx + 1} batch`}
                            value={line.batch ?? ""}
                            onChange={(e) => {
                              const next = [...items];
                              next[idx] = { ...next[idx], batch: e.target.value };
                              setItems(next);
                            }}
                          />
                          <Input
                            type="date"
                            aria-label={`Line ${idx + 1} expiry`}
                            value={line.expiry ?? ""}
                            onChange={(e) => {
                              const next = [...items];
                              next[idx] = { ...next[idx], expiry: e.target.value };
                              setItems(next);
                            }}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                            disabled={items.length <= 1}
                            onClick={() => setItems(items.filter((_, i) => i !== idx))}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setItems([...items, { sku: "", qty: 1, cost: 0, batch: "", expiry: "" }])
                      }
                    >
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      Add line
                    </Button>
                  </div>

                  <Separator />

                  {/* ── Bottom section: Costs (left) + Summary (right) ── */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* Left: Landed costs + notes + options */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Landed Costs &amp; Tax</Label>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Freight</Label>
                            <Input
                              type="number"
                              min={0}
                              step="0.01"
                              placeholder="0.00"
                              value={freightCost}
                              onChange={(e) => setFreightCost(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Duty</Label>
                            <Input
                              type="number"
                              min={0}
                              step="0.01"
                              placeholder="0.00"
                              value={dutyCost}
                              onChange={(e) => setDutyCost(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Tax</Label>
                            <Input
                              type="number"
                              min={0}
                              step="0.01"
                              placeholder="0.00"
                              value={headerTax}
                              onChange={(e) => setHeaderTax(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="grn-notes">Notes (optional)</Label>
                        <Textarea
                          id="grn-notes"
                          placeholder="Internal remarks for this receipt…"
                          rows={2}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Options</Label>
                        <div className="flex items-start gap-2">
                          <Checkbox
                            id="grn-qc"
                            checked={requiresQc}
                            onCheckedChange={(v) => setRequiresQc(v === true)}
                            className="mt-0.5"
                          />
                          <div>
                            <Label htmlFor="grn-qc" className="text-sm font-normal leading-snug">
                              Send to QC quarantine
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Stock not sellable until QC accepted
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Checkbox
                            id="grn-cost-update"
                            checked={updateProductCost}
                            onCheckedChange={(v) => setUpdateProductCost(v === true)}
                            className="mt-0.5"
                          />
                          <div>
                            <Label
                              htmlFor="grn-cost-update"
                              className="text-sm font-normal leading-snug"
                            >
                              Update product cost from receipt
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Uses tenant cost mode (last / weighted average)
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Live GRN summary */}
                    <div className="rounded-lg border bg-muted/30 p-4">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        GRN Summary
                      </p>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Lines subtotal</span>
                          <span className="tabular-nums">{formatMoney(subtotal)}</span>
                        </div>
                        {Number(freightCost) > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Freight</span>
                            <span className="tabular-nums">+ {formatMoney(Number(freightCost))}</span>
                          </div>
                        )}
                        {Number(dutyCost) > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Duty</span>
                            <span className="tabular-nums">+ {formatMoney(Number(dutyCost))}</span>
                          </div>
                        )}
                        {Number(headerTax) > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tax</span>
                            <span className="tabular-nums">+ {formatMoney(Number(headerTax))}</span>
                          </div>
                        )}
                        <Separator className="my-1.5" />
                        <div className="flex justify-between text-base font-semibold">
                          <span>Grand Total</span>
                          <span className="tabular-nums">{formatMoney(grandTotal)}</span>
                        </div>
                      </div>

                      {requiresQc && (
                        <div className="mt-3 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
                          ⚠ Stock will go to QC quarantine — not available to sell until accepted
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <SheetFooter className="border-t pt-4">
                  <div className="flex w-full items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Total:{" "}
                      <strong className="text-foreground">{formatMoney(grandTotal)}</strong>
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setOpen(false);
                          resetForm();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => void submit()}
                        disabled={
                          createGrn.isPending ||
                          items.filter((i) => i.sku && i.qty > 0).length === 0
                        }
                      >
                        {createGrn.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Post GRN
                      </Button>
                    </div>
                  </div>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        }
      />

      {/* ── Filter Bar ── */}
      <Card>
        <CardContent className="flex flex-wrap items-end gap-4 p-4">
          <div className="min-w-[160px] space-y-1.5">
            <Label>PO id</Label>
            <Input
              placeholder="Purchase order id"
              value={poFilter}
              onChange={(e) => {
                setPoFilter(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="min-w-[200px] flex-1 space-y-1.5">
            <Label>Filter by supplier</Label>
            <SupplierSelect
              value={supplierFilter}
              onValueChange={(v) => {
                setSupplierFilter(v);
                setPage(1);
              }}
              placeholder="All suppliers"
              activeOnly={false}
            />
          </div>
          {(supplierFilter || poFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSupplierFilter("");
                setPoFilter("");
              }}
            >
              Clear filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* ── GRN Table ── */}
      <Card>
        <CardContent className="p-0">
          {isLoading && grns.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">Loading GRNs…</p>
          ) : grns.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              No GRNs yet. Post a receipt to increase stock.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>GRN</TableHead>
                  <TableHead>PO</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Lines</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grns.map((g) => (
                  <TableRow key={g.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <Link
                        to="/app/inv/grn/$grnId"
                        params={{ grnId: String(g.id) }}
                        className="inline-flex items-center gap-2 font-mono text-xs hover:underline"
                      >
                        <PackageCheck className="h-4 w-4 text-success" />
                        {g.number}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {g.purchase_order_id ? (
                        <Link
                          to="/app/inv/purchase-orders/$orderId"
                          params={{ orderId: String(g.purchase_order_id) }}
                          className="hover:underline"
                        >
                          #{g.purchase_order_id}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{grnSupplierName(g)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {grnLineSummary(g)}
                    </TableCell>
                    <TableCell className="font-semibold tabular-nums">
                      {formatMoney(g.total_amount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {g.received_date ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={purchaseStatusTone(g.status)}>
                        {g.status}
                      </Badge>
                      {g.qc_status && g.qc_status !== "none" && (
                        <Badge variant="secondary" className="ml-1 text-xs">
                          QC: {g.qc_status}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {pagination && pagination.lastPage > 1 && (
        <PaginationBar pagination={pagination} onPageChange={setPage} />
      )}
      {isFetching && !isLoading && (
        <p className="text-center text-xs text-muted-foreground">Refreshing…</p>
      )}
    </div>
  );
}
