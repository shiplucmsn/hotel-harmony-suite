import { useMemo, useState } from "react";
import { useDeferredValue } from "react";
import { ArrowRightLeft, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SkuPicker } from "@/shared/components/forms/sku-picker";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { SearchableSelect } from "@/shared/components/forms/searchable-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateStockTransfer, useStockTransfers } from "@/hooks/inventory/use-stock-transfers";
import { useInventoryWarehouses } from "@/hooks/inventory/use-inventory-warehouses";
import { formatTransferStatus, transferStatusClass } from "@/modules/inventory/utils";
import { cn } from "@/lib/utils";

type LineDraft = { sku: string; quantity: number };

const emptyLine = (): LineDraft => ({ sku: "", quantity: 1 });

export function TransfersPage() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const [fromWarehouseId, setFromWarehouseId] = useState("");
  const [toWarehouseId, setToWarehouseId] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineDraft[]>([emptyLine()]);
  const [draftSku, setDraftSku] = useState("");
  const [draftQty, setDraftQty] = useState(1);

  const { data, isLoading, isError } = useStockTransfers({
    search: deferredSearch || undefined,
    per_page: 50,
  });
  const { data: warehousesData } = useInventoryWarehouses();
  const createTransfer = useCreateStockTransfer();

  const transfers = data?.data ?? [];
  const warehouses = warehousesData?.data ?? [];

  const warehouseOptions = useMemo(
    () =>
      warehouses.map((w) => ({
        value: String(w.id),
        label: `${w.code} — ${w.name}`,
        keywords: w.location ?? "",
      })),
    [warehouses],
  );

  const resetForm = () => {
    setFromWarehouseId("");
    setToWarehouseId("");
    setExpectedDate("");
    setNotes("");
    setLines([emptyLine()]);
    setDraftSku("");
    setDraftQty(1);
  };

  const addLine = () => {
    if (!draftSku.trim() || draftQty <= 0) return;
    setLines((prev) => [...prev, { sku: draftSku.trim(), quantity: draftQty }]);
    setDraftSku("");
    setDraftQty(1);
  };

  const handleCreate = async () => {
    const cleaned = lines.filter((l) => l.sku.trim() && l.quantity > 0);
    if (!fromWarehouseId || !toWarehouseId || cleaned.length === 0) return;

    await createTransfer.mutateAsync({
      from_warehouse_id: Number(fromWarehouseId),
      to_warehouse_id: Number(toWarehouseId),
      expected_date: expectedDate || undefined,
      notes: notes.trim() || undefined,
      status: "completed",
      lines: cleaned.map((l) => ({ sku: l.sku.trim(), quantity: l.quantity })),
    });

    setOpen(false);
    resetForm();
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "—";
    return value.slice(0, 10);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Transfer"
        description="Move inventory between warehouses."
        breadcrumbs={[{ label: "Inventory" }, { label: "Stock Transfer" }]}
        actions={
          <Sheet
            open={open}
            onOpenChange={(next) => {
              setOpen(next);
              if (!next) resetForm();
            }}
          >
            <SheetTrigger asChild>
              <Button size="sm" className="gradient-primary text-primary-foreground border-0">
                <Plus className="h-4 w-4 mr-2" />
                New transfer
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-lg overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Create stock transfer</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>From</Label>
                    <SearchableSelect
                      value={fromWarehouseId}
                      onValueChange={setFromWarehouseId}
                      options={warehouseOptions}
                      placeholder="Source warehouse"
                      searchPlaceholder="Search warehouses…"
                    />
                  </div>
                  <div>
                    <Label>To</Label>
                    <SearchableSelect
                      value={toWarehouseId}
                      onValueChange={setToWarehouseId}
                      options={warehouseOptions.filter((o) => o.value !== fromWarehouseId)}
                      placeholder="Destination"
                      searchPlaceholder="Search warehouses…"
                    />
                  </div>
                </div>
                <div>
                  <Label>Expected date</Label>
                  <Input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} />
                </div>
                <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
                  <p className="text-sm font-medium">Line items</p>
                  {lines.map((line, idx) => (
                    <div key={`${idx}-${line.sku}`} className="flex items-center gap-2 text-sm">
                      <span className="font-mono flex-1 truncate">{line.sku}</span>
                      <span className="text-muted-foreground">× {line.quantity}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setLines((prev) => prev.filter((_, i) => i !== idx))}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                  <div className="grid grid-cols-12 gap-2">
                    <SkuPicker
                      className="col-span-6"
                      value={draftSku}
                      onValueChange={setDraftSku}
                      placeholder="Search SKU…"
                    />
                    <Input
                      className="col-span-3"
                      type="number"
                      min={0.001}
                      step="any"
                      placeholder="Qty"
                      value={draftQty}
                      onChange={(e) => setDraftQty(Number(e.target.value) || 0)}
                    />
                    <Button type="button" variant="outline" size="sm" className="col-span-3" onClick={addLine}>
                      + Add
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Reference / notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
              <SheetFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => void handleCreate()}
                  disabled={
                    createTransfer.isPending ||
                    !fromWarehouseId ||
                    !toWarehouseId ||
                    lines.every((l) => !l.sku.trim())
                  }
                >
                  {createTransfer.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create transfer
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        }
      />

      <Card>
        <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b">
          <p className="text-sm text-muted-foreground">
            {data?.pagination?.total ?? transfers.length} transfer(s)
          </p>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Search number, SKU, warehouse…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
        <CardContent className="p-0">
          {isLoading && (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          )}
          {isError && (
            <p className="p-6 text-sm text-destructive">Failed to load transfers. Check API connection.</p>
          )}
          {!isLoading && !isError && transfers.length === 0 && (
            <EmptyState
              icon={ArrowRightLeft}
              title="No transfers yet"
              description="Create a transfer to move stock between warehouses."
            />
          )}
          {!isLoading && !isError && transfers.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.map((t) => (
                  <TableRow key={t.number}>
                    <TableCell className="font-mono text-xs">{t.number}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-2 text-sm">
                        <span className="font-medium">{t.from_warehouse_name ?? `WH #${t.from_warehouse_id}`}</span>
                        <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{t.to_warehouse_name ?? `WH #${t.to_warehouse_id}`}</span>
                      </span>
                    </TableCell>
                    <TableCell>{t.line_count}</TableCell>
                    <TableCell>{t.total_quantity}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(t.created_at)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(transferStatusClass(t.status))}>
                        {formatTransferStatus(t.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
