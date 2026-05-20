import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
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

type GrnLine = { sku: string; qty: number; cost: number };

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
  const [items, setItems] = useState<GrnLine[]>([{ sku: "", qty: 1, cost: 0 }]);

  const listParams = useMemo(
    () => ({
      page,
      per_page: 20,
      supplier_id: supplierFilter ? Number(supplierFilter) : undefined,
    }),
    [page, supplierFilter],
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
    await createGrn.mutateAsync({
      supplier_id: supplierId ? Number(supplierId) : undefined,
      warehouse_id: warehouseId ? Number(warehouseId) : undefined,
      purchase_order_id: poId ? Number(poId) : undefined,
      received_date: receivedDate,
      lines: lines.map((l) => ({
        sku: l.sku,
        quantity: l.qty,
        unit_cost: l.cost,
      })),
    });
    setOpen(false);
    setItems([{ sku: "", qty: 1, cost: 0 }]);
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
                    {items.map((line, idx) => (
                      <div key={idx} className="grid grid-cols-[1fr_72px_88px_32px] gap-2">
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
                          placeholder="Qty"
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
                          placeholder="Cost"
                          value={line.cost || ""}
                          onChange={(e) => {
                            const next = [...items];
                            next[idx] = { ...next[idx], cost: Number(e.target.value) };
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
                      onClick={() => setItems([...items, { sku: "", qty: 1, cost: 0 }])}
                    >
                      Add line
                    </Button>
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
          {supplierFilter && (
            <Button variant="ghost" size="sm" onClick={() => setSupplierFilter("")}>
              Clear filter
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
                  <TableRow key={g.id}>
                    <TableCell>
                      <span className="inline-flex items-center gap-2 font-mono text-xs">
                        <PackageCheck className="h-4 w-4 text-success" />
                        {g.number}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {g.purchase_order_id ? `#${g.purchase_order_id}` : "—"}
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
