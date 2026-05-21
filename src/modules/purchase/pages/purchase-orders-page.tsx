import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { SupplierSelect } from "@/modules/purchase/components/supplier-select";
import {
  useCancelPurchaseOrder,
  useCreatePurchaseOrder,
  usePurchaseOrders,
} from "@/hooks/purchase/use-purchase";
import { useInventoryWarehouses } from "@/hooks/inventory/use-inventory-warehouses";
import { formatMoney, purchaseStatusTone } from "@/modules/purchase/utils";

type PoLine = { sku: string; qty: number; price: number };

type PurchaseOrdersPageProps = {
  initialSupplierId?: number;
  openNewPo?: boolean;
};

export function PurchaseOrdersPage({ initialSupplierId, openNewPo }: PurchaseOrdersPageProps) {
  const [open, setOpen] = useState(false);
  const [statusTab, setStatusTab] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [supplierId, setSupplierId] = useState(initialSupplierId ? String(initialSupplierId) : "");
  const [warehouseId, setWarehouseId] = useState("");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10));
  const [expectedDate, setExpectedDate] = useState("");
  const [items, setItems] = useState<PoLine[]>([{ sku: "", qty: 1, price: 0 }]);

  useEffect(() => {
    if (openNewPo) setOpen(true);
  }, [openNewPo]);

  useEffect(() => {
    if (initialSupplierId) setSupplierId(String(initialSupplierId));
  }, [initialSupplierId]);

  const listParams = useMemo(
    () => ({
      page,
      per_page: 20,
      status: statusTab === "all" ? undefined : statusTab,
      supplier_id: initialSupplierId,
    }),
    [page, statusTab, initialSupplierId],
  );

  const { data, isLoading, isFetching } = usePurchaseOrders(listParams);
  const orders = data?.data ?? [];
  const pagination = data?.pagination;
  const { data: warehousesRes } = useInventoryWarehouses();
  const warehouses = warehousesRes?.data ?? [];
  const createOrder = useCreatePurchaseOrder();
  const cancelOrder = useCancelPurchaseOrder();

  const total = items.reduce((a, i) => a + i.qty * i.price, 0);

  const stats = useMemo(() => {
    const open = orders.filter((o) => ["pending", "draft", "sent"].includes(o.status)).length;
    const spend = orders.reduce((s, o) => s + o.total_amount, 0);
    return { open, spend, count: orders.length };
  }, [orders]);

  const submitPo = async (asDraft: boolean) => {
    const lines = items.filter((i) => i.sku && i.qty > 0);
    if (!supplierId) return;
    if (lines.length === 0) return;

    const res = await createOrder.mutateAsync({
      supplier_id: Number(supplierId),
      warehouse_id: warehouseId ? Number(warehouseId) : undefined,
      order_date: orderDate,
      expected_date: expectedDate || undefined,
      status: asDraft ? "draft" : "pending",
      lines: lines.map((i) => ({
        sku: i.sku,
        quantity: i.qty,
        unit_cost: i.price,
      })),
    });
    setOpen(false);
    setPage(1);
    const createdStatus = res.data?.status;
    if (createdStatus && ["draft", "pending", "pending_approval", "partial", "received", "cancelled"].includes(createdStatus)) {
      setStatusTab(createdStatus);
    }
    setItems([{ sku: "", qty: 1, price: 0 }]);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        description="Procurement requests to suppliers."
        breadcrumbs={[{ label: "Purchases" }, { label: "Orders" }]}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link to="/app/inv/suppliers">Suppliers</Link>
            </Button>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button size="sm" className="gradient-primary border-0 text-primary-foreground">
                  <Plus className="mr-2 h-4 w-4" />
                  New PO
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto sm:max-w-2xl">
                <SheetHeader>
                  <SheetTitle>Create purchase order</SheetTitle>
                </SheetHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Supplier *</Label>
                      <SupplierSelect value={supplierId} onValueChange={setSupplierId} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Warehouse</Label>
                      <Select value={warehouseId} onValueChange={setWarehouseId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Receiving location…" />
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
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Order date</Label>
                      <Input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Expected</Label>
                      <Input
                        type="date"
                        value={expectedDate}
                        onChange={(e) => setExpectedDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <Card>
                    <CardContent className="p-3">
                      <div className="mb-3 flex items-center justify-between">
                        <Label>Line items</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          type="button"
                          onClick={() => setItems([...items, { sku: "", qty: 1, price: 0 }])}
                        >
                          + Add line
                        </Button>
                      </div>
                      <div
                        className="mb-1 grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground"
                        aria-hidden={items.length === 0}
                      >
                        <span className="col-span-5">Product (SKU)</span>
                        <span className="col-span-2">Quantity</span>
                        <span className="col-span-3">Unit cost</span>
                        <span className="col-span-1 text-right">Line total</span>
                        <span className="col-span-1" />
                      </div>
                      <div className="space-y-2">
                        {items.map((it, i) => (
                          <div key={i} className="grid grid-cols-12 items-center gap-2">
                            <SkuPicker
                              className="col-span-5"
                              value={it.sku}
                              onValueChange={(sku) => {
                                const c = [...items];
                                c[i].sku = sku;
                                setItems(c);
                              }}
                              placeholder="Search SKU…"
                              aria-label={`Line ${i + 1} product`}
                            />
                            <Input
                              className="col-span-2"
                              type="number"
                              min={0}
                              step="any"
                              aria-label={`Line ${i + 1} quantity`}
                              value={it.qty}
                              onChange={(e) => {
                                const c = [...items];
                                c[i].qty = +e.target.value;
                                setItems(c);
                              }}
                            />
                            <Input
                              className="col-span-3"
                              type="number"
                              min={0}
                              step="0.01"
                              aria-label={`Line ${i + 1} unit cost`}
                              value={it.price}
                              onChange={(e) => {
                                const c = [...items];
                                c[i].price = +e.target.value;
                                setItems(c);
                              }}
                            />
                            <div className="col-span-1 text-right text-sm tabular-nums">
                              {(it.qty * it.price).toFixed(0)}
                            </div>
                            <Button
                              className="col-span-1"
                              variant="ghost"
                              size="icon"
                              type="button"
                              onClick={() => setItems(items.filter((_, j) => j !== i))}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex justify-between border-t pt-3 text-sm">
                        <span className="font-medium">Total</span>
                        <span className="font-semibold">{formatMoney(total)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <SheetFooter>
                  <Button
                    variant="outline"
                    disabled={createOrder.isPending}
                    onClick={() => void submitPo(true)}
                  >
                    Save draft
                  </Button>
                  <Button
                    disabled={createOrder.isPending || !supplierId}
                    onClick={() => void submitPo(false)}
                  >
                    {createOrder.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit PO
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase text-muted-foreground">On this page</p>
            <p className="mt-2 text-2xl font-semibold">{stats.count}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase text-muted-foreground">Open POs</p>
            <p className="mt-2 text-2xl font-semibold">{stats.open}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase text-muted-foreground">Page total</p>
            <p className="mt-2 text-2xl font-semibold">{formatMoney(stats.spend)}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={statusTab}
        onValueChange={(v) => {
          setStatusTab(v);
          setPage(1);
        }}
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="pending_approval">Awaiting approval</TabsTrigger>
          <TabsTrigger value="partial">Partial</TabsTrigger>
          <TabsTrigger value="received">Received</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        <TabsContent value={statusTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Expected</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(isLoading || isFetching) && orders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                        Loading…
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading && orders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                        No purchase orders yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {orders.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell className="font-mono text-xs">
                        <Link
                          to="/app/inv/purchase-orders/$orderId"
                          params={{ orderId: String(po.id) }}
                          className="hover:underline"
                        >
                          {po.number}
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium">
                        {po.supplier_id ? (
                          <Link
                            to="/app/inv/supplier-ledger"
                            search={{ supplier_id: po.supplier_id }}
                            className="hover:underline"
                          >
                            {po.supplier}
                          </Link>
                        ) : (
                          po.supplier
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{po.order_date ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {po.expected_date ?? "—"}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {formatMoney(po.total_amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={purchaseStatusTone(po.status)}>
                          {po.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link
                                to="/app/inv/purchase-orders/$orderId"
                                params={{ orderId: String(po.id) }}
                              >
                                View details
                              </Link>
                            </DropdownMenuItem>
                            {po.supplier_id && (
                              <DropdownMenuItem asChild>
                                <Link
                                  to="/app/inv/supplier-ledger"
                                  search={{ supplier_id: po.supplier_id }}
                                >
                                  Supplier ledger
                                </Link>
                              </DropdownMenuItem>
                            )}
                            {!["received", "cancelled"].includes(po.status) && (
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => void cancelOrder.mutateAsync(po.id)}
                              >
                                Cancel PO
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {pagination && pagination.lastPage > 1 && (
                <PaginationBar pagination={pagination} onPageChange={setPage} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
