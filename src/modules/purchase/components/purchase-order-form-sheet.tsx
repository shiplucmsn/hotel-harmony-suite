import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SkuPicker } from "@/shared/components/forms/sku-picker";
import { SupplierSelect } from "@/modules/purchase/components/supplier-select";
import {
  useCreatePurchaseOrder,
  usePurchaseOrder,
  useSubmitPurchaseOrder,
  useUpdatePurchaseOrder,
} from "@/hooks/purchase/use-purchase";
import { useInventoryWarehouses } from "@/hooks/inventory/use-inventory-warehouses";
import { formatMoney } from "@/modules/purchase/utils";
import type { PurchaseOrderDto } from "@/modules/purchase/types";

type PoLine = { sku: string; qty: number; price: number };

type PurchaseOrderFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  orderId?: number | string | null;
  defaultSupplierId?: number;
  onSaved?: (order: PurchaseOrderDto) => void;
};

export function PurchaseOrderFormSheet({
  open,
  onOpenChange,
  mode,
  orderId,
  defaultSupplierId,
  onSaved,
}: PurchaseOrderFormSheetProps) {
  const isEdit = mode === "edit" && orderId != null && orderId !== "";
  const { data: existing, isLoading: loadingOrder } = usePurchaseOrder(isEdit && open ? orderId : null);
  const { data: warehousesRes } = useInventoryWarehouses();
  const warehouses = warehousesRes?.data ?? [];
  const createOrder = useCreatePurchaseOrder();
  const updateOrder = useUpdatePurchaseOrder();
  const submitOrder = useSubmitPurchaseOrder();

  const [supplierId, setSupplierId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10));
  const [expectedDate, setExpectedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [exchangeRate, setExchangeRate] = useState("1");
  const [items, setItems] = useState<PoLine[]>([{ sku: "", qty: 1, price: 0 }]);

  useEffect(() => {
    if (!open) return;
    if (!isEdit) {
      setSupplierId(defaultSupplierId ? String(defaultSupplierId) : "");
      setWarehouseId("");
      setOrderDate(new Date().toISOString().slice(0, 10));
      setExpectedDate("");
      setNotes("");
      setCurrencyCode("USD");
      setExchangeRate("1");
      setItems([{ sku: "", qty: 1, price: 0 }]);
      return;
    }
    if (!existing) return;
    setSupplierId(existing.supplier_id ? String(existing.supplier_id) : "");
    setCurrencyCode(existing.currency_code ?? "USD");
    setExchangeRate(String(existing.exchange_rate ?? 1));
    setWarehouseId(existing.warehouse_id ? String(existing.warehouse_id) : "");
    setOrderDate(existing.order_date ?? new Date().toISOString().slice(0, 10));
    setExpectedDate(existing.expected_date ?? "");
    setNotes(existing.notes ?? "");
    setItems(
      (existing.lines ?? []).length > 0
        ? (existing.lines ?? []).map((l) => ({
            sku: l.sku,
            qty: l.quantity_ordered ?? 1,
            price: l.unit_cost ?? 0,
          }))
        : [{ sku: "", qty: 1, price: 0 }],
    );
  }, [open, isEdit, existing, defaultSupplierId]);

  const total = useMemo(() => items.reduce((a, i) => a + i.qty * i.price, 0), [items]);
  const isPending = createOrder.isPending || updateOrder.isPending || submitOrder.isPending;

  const buildLines = () =>
    items
      .filter((i) => i.sku && i.qty > 0)
      .map((i) => ({
        sku: i.sku,
        quantity: i.qty,
        unit_cost: i.price,
      }));

  const saveDraft = async () => {
    const lines = buildLines();
    if (!supplierId || lines.length === 0) return;

    if (isEdit && orderId) {
      const res = await updateOrder.mutateAsync({
        id: orderId,
        body: {
          supplier_id: Number(supplierId),
          warehouse_id: warehouseId ? Number(warehouseId) : null,
          order_date: orderDate,
          expected_date: expectedDate || null,
          notes: notes || null,
          lines,
        },
      });
      onSaved?.(res.data);
      onOpenChange(false);
      return;
    }

    const res = await createOrder.mutateAsync({
      supplier_id: Number(supplierId),
      warehouse_id: warehouseId ? Number(warehouseId) : undefined,
      order_date: orderDate,
      expected_date: expectedDate || undefined,
      notes: notes || undefined,
      status: "draft",
      lines,
    });
    onSaved?.(res.data);
    onOpenChange(false);
  };

  const submitPo = async () => {
    const lines = buildLines();
    if (!supplierId || lines.length === 0) return;

    if (isEdit && orderId) {
      await updateOrder.mutateAsync({
        id: orderId,
        body: {
          supplier_id: Number(supplierId),
          warehouse_id: warehouseId ? Number(warehouseId) : null,
          order_date: orderDate,
          expected_date: expectedDate || null,
          notes: notes || null,
          currency_code: currencyCode,
          exchange_rate: Number(exchangeRate) || 1,
          lines,
        },
      });
      const res = await submitOrder.mutateAsync({ id: orderId });
      onSaved?.(res.data);
      onOpenChange(false);
      return;
    }

    const res = await createOrder.mutateAsync({
      supplier_id: Number(supplierId),
      warehouse_id: warehouseId ? Number(warehouseId) : undefined,
      order_date: orderDate,
      expected_date: expectedDate || undefined,
      notes: notes || undefined,
      currency_code: currencyCode,
      exchange_rate: Number(exchangeRate) || 1,
      status: "pending",
      lines,
    });
    onSaved?.(res.data);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit purchase order" : "Create purchase order"}</SheetTitle>
        </SheetHeader>

        {isEdit && loadingOrder && (
          <p className="py-8 text-sm text-muted-foreground">Loading order…</p>
        )}

        {(!isEdit || existing) && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Supplier *</Label>
                <SupplierSelect value={supplierId} onValueChange={setSupplierId} activeOnly />
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
                <Label>Expected delivery</Label>
                <Input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Currency</Label>
                <Input
                  maxLength={3}
                  value={currencyCode}
                  onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
                  placeholder="USD"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Rate to base</Label>
                <Input
                  type="number"
                  min={0.000001}
                  step="0.0001"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal notes for procurement…"
              />
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
                <div className="mb-1 grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground">
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
                        {formatMoney(it.qty * it.price)}
                      </div>
                      <Button
                        className="col-span-1"
                        variant="ghost"
                        size="icon"
                        type="button"
                        disabled={items.length <= 1}
                        onClick={() => setItems(items.filter((_, j) => j !== i))}
                      >
                        ×
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
        )}

        <SheetFooter>
          <Button variant="outline" disabled={isPending} onClick={() => void saveDraft()}>
            {isEdit ? "Save changes" : "Save draft"}
          </Button>
          <Button disabled={isPending || !supplierId} onClick={() => void submitPo()}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Submit PO" : "Submit PO"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
