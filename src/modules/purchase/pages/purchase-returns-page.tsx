import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, Plus, Trash2, Undo2 } from "lucide-react";
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
import { useCreatePurchaseReturn, usePurchaseReturns } from "@/hooks/purchase/use-purchase";
import { useInventoryWarehouses } from "@/hooks/inventory/use-inventory-warehouses";
import { formatMoney, purchaseStatusTone } from "@/modules/purchase/utils";
import type { PurchaseReturnDto } from "@/modules/purchase/types";

type ReturnLine = { sku: string; qty: number; cost: number };

type PurchaseReturnsPageProps = {
  initialSupplierId?: number;
  openNew?: boolean;
};

function returnQty(r: PurchaseReturnDto): number {
  return r.lines?.reduce((s, l) => s + l.quantity, 0) ?? 0;
}

export function PurchaseReturnsPage({ initialSupplierId, openNew }: PurchaseReturnsPageProps) {
  const [open, setOpen] = useState(openNew ?? false);
  const [page, setPage] = useState(1);
  const [supplierFilter, setSupplierFilter] = useState(
    initialSupplierId ? String(initialSupplierId) : "",
  );
  const [supplierId, setSupplierId] = useState(
    initialSupplierId ? String(initialSupplierId) : "",
  );
  const [warehouseId, setWarehouseId] = useState("");
  const [returnDate, setReturnDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ReturnLine[]>([{ sku: "", qty: 1, cost: 0 }]);

  const listParams = useMemo(
    () => ({
      page,
      per_page: 20,
      supplier_id: supplierFilter ? Number(supplierFilter) : undefined,
    }),
    [page, supplierFilter],
  );

  const { data, isLoading, isFetching } = usePurchaseReturns(listParams);
  const returns = data?.data ?? [];
  const pagination = data?.pagination;
  const { data: warehousesRes } = useInventoryWarehouses();
  const warehouses = warehousesRes?.data ?? [];
  const createReturn = useCreatePurchaseReturn();

  const submit = async () => {
    if (!supplierId) return;
    const lines = items.filter((i) => i.sku && i.qty > 0);
    if (lines.length === 0) return;
    await createReturn.mutateAsync({
      supplier_id: Number(supplierId),
      warehouse_id: warehouseId ? Number(warehouseId) : undefined,
      return_date: returnDate,
      notes: notes || undefined,
      lines: lines.map((l) => ({
        sku: l.sku,
        quantity: l.qty,
        unit_cost: l.cost,
      })),
    });
    setOpen(false);
    setItems([{ sku: "", qty: 1, cost: 0 }]);
    setNotes("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Returns"
        description="Return goods to suppliers. Posting reduces stock and adjusts vendor AP."
        breadcrumbs={[{ label: "Purchases" }, { label: "Returns" }]}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link to="/app/inv/suppliers">Suppliers</Link>
            </Button>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button size="sm" className="gradient-primary border-0 text-primary-foreground">
                  <Plus className="mr-2 h-4 w-4" />
                  New return
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto sm:max-w-lg">
                <SheetHeader>
                  <SheetTitle>Post purchase return</SheetTitle>
                </SheetHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-1.5">
                    <Label>Supplier *</Label>
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
                      <Label>Return date</Label>
                      <Input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Notes / reason</Label>
                    <Input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Damaged batch, wrong item…"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Lines *</Label>
                    <div className="grid grid-cols-[1fr_72px_88px_32px] gap-2 text-xs font-medium text-muted-foreground">
                      <span>Product (SKU)</span>
                      <span>Quantity</span>
                      <span>Unit cost</span>
                      <span />
                    </div>
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
                  <Button
                    onClick={() => void submit()}
                    disabled={createReturn.isPending || !supplierId}
                  >
                    {createReturn.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Post return
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
          {isLoading && returns.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">Loading returns…</p>
          ) : returns.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">No purchase returns yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returns.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <span className="inline-flex items-center gap-2 font-mono text-xs">
                        <Undo2 className="h-4 w-4 text-primary" />
                        {r.number}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {r.supplier?.name ?? `Supplier #${r.supplier_id}`}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {r.notes ?? "—"}
                    </TableCell>
                    <TableCell>{returnQty(r)}</TableCell>
                    <TableCell className="font-semibold tabular-nums">
                      {formatMoney(r.total_amount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.return_date ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={purchaseStatusTone(r.status)}>
                        {r.status}
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
