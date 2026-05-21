import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, PackageCheck, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SkuPicker } from "@/shared/components/forms/sku-picker";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
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
  const [headerTax, setHeaderTax] = useState("");

  const [poFilter, setPoFilter] = useState("");

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

  const submit = async () => {
    const lines = items.filter((i) => i.sku && i.qty > 0);
    if (lines.length === 0) return;
    const landed_costs = [];
    const freight = Number(freightCost);
    if (freight > 0) {
      landed_costs.push({ cost_type: "freight" as const, amount: freight, allocation_method: "qty" as const });
    }

    await createGrn.mutateAsync({
      supplier_id: supplierId ? Number(supplierId) : undefined,
      warehouse_id: warehouseId ? Number(warehouseId) : undefined,
      purchase_order_id: poId ? Number(poId) : undefined,
      received_date: receivedDate,
      tax_amount: headerTax ? Number(headerTax) : undefined,
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
    setItems([{ sku: "", qty: 1, cost: 0, batch: "", expiry: "" }]);
    setPoId("");
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
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button size="sm" className="gradient-primary border-0 text-primary-foreground">
                  <Plus className="mr-2 h-4 w-4" />
                  New GRN
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto sm:max-w-lg">
                <SheetHeader>
                  <SheetTitle>Post goods receipt</SheetTitle>
                </SheetHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-1.5">
                    <Label>Supplier</Label>
                    <SupplierSelect value={supplierId} onValueChange={setSupplierId} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Warehouse</Label>
                      <Select value={warehouseId} onValueChange={setWarehouseId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select…" />
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
                    <div className="space-y-1.5">
                      <Label>Received date</Label>
                      <Input
                        type="date"
                        value={receivedDate}
                        onChange={(e) => setReceivedDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>PO ID (optional)</Label>
                    <Input
                      type="number"
                      placeholder="Purchase order id"
                      value={poId}
                      onChange={(e) => setPoId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Lines</Label>
                    <div className="grid grid-cols-[1fr_72px_88px_96px_110px_32px] gap-2 text-xs font-medium text-muted-foreground">
                      <span>Product (SKU)</span>
                      <span>Quantity</span>
                      <span>Unit cost</span>
                      <span>Lot</span>
                      <span>Expiry</span>
                      <span />
                    </div>
                    {items.map((line, idx) => (
                      <div key={idx} className="grid grid-cols-[1fr_72px_88px_96px_110px_32px] gap-2">
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
                          disabled={items.length <= 1}
                          onClick={() => setItems(items.filter((_, i) => i !== idx))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setItems([...items, { sku: "", qty: 1, cost: 0, batch: "", expiry: "" }])}
                    >
                      Add line
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 px-1">
                  <div className="space-y-1.5">
                    <Label>Freight (base)</Label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={freightCost}
                      onChange={(e) => setFreightCost(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Header tax (base)</Label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={headerTax}
                      onChange={(e) => setHeaderTax(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2 px-1">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="grn-requires-qc"
                      checked={requiresQc}
                      onCheckedChange={(v) => setRequiresQc(v === true)}
                    />
                    <Label htmlFor="grn-requires-qc" className="text-sm font-normal">
                      Send to QC quarantine
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="grn-update-product-cost"
                      checked={updateProductCost}
                      onCheckedChange={(v) => setUpdateProductCost(v === true)}
                    />
                    <Label htmlFor="grn-update-product-cost" className="text-sm font-normal">
                      Update product cost from receipt
                    </Label>
                  </div>
                </div>
                <SheetFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => void submit()} disabled={createGrn.isPending}>
                    {createGrn.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Post GRN
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        }
      />

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
