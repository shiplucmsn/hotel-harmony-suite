import { useDeferredValue, useMemo, useState } from "react";
import { Layers, Loader2, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { SkuPicker } from "@/shared/components/forms/sku-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateInventoryBatch, useInventoryBatches } from "@/hooks/inventory/use-inventory-batches";
import { useInventoryWarehouses } from "@/hooks/inventory/use-inventory-warehouses";
import { cn } from "@/lib/utils";

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "expiring_soon", label: "Expiring soon" },
  { value: "expired", label: "Expired" },
  { value: "depleted", label: "Depleted" },
] as const;

function batchStatusClass(status: string): string {
  const map: Record<string, string> = {
    active: "bg-success/10 text-success",
    expiring_soon: "bg-warning/10 text-warning",
    expired: "bg-destructive/10 text-destructive",
    depleted: "bg-muted text-muted-foreground",
    quarantine: "bg-info/10 text-info",
  };
  return map[status] ?? "bg-muted text-muted-foreground";
}

export function BatchesPage() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<string>("all");
  const deferredSearch = useDeferredValue(search);

  const [sku, setSku] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [qty, setQty] = useState(1);
  const [expiryDate, setExpiryDate] = useState("");
  const [manufacturedAt, setManufacturedAt] = useState("");
  const [notes, setNotes] = useState("");

  const listParams = {
    search: deferredSearch || undefined,
    per_page: 100,
    status: tab === "all" ? undefined : tab,
  };

  const { data, isLoading, isError, isFetching } = useInventoryBatches(listParams);
  const { data: warehousesData } = useInventoryWarehouses();
  const createBatch = useCreateInventoryBatch();

  const batches = data?.data ?? [];
  const warehouses = warehousesData?.data ?? [];

  const warehouseOptions = useMemo(
    () =>
      warehouses.map((w) => ({
        value: String(w.id),
        label: `${w.code} — ${w.name}`,
      })),
    [warehouses],
  );

  const resetForm = () => {
    setSku("");
    setWarehouseId("");
    setBatchNumber("");
    setQty(1);
    setExpiryDate("");
    setManufacturedAt("");
    setNotes("");
  };

  const handleCreate = async () => {
    if (!sku.trim()) return;
    await createBatch.mutateAsync({
      sku: sku.trim(),
      warehouse_id: warehouseId ? Number(warehouseId) : undefined,
      batch_number: batchNumber.trim() || undefined,
      qty_on_hand: Number(qty) || 0,
      expiry_date: expiryDate || undefined,
      manufactured_at: manufacturedAt || undefined,
      notes: notes.trim() || undefined,
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
        title="Batch Tracking"
        description="Track lots, batch numbers, and expiry dates across products."
        breadcrumbs={[{ label: "Inventory" }, { label: "Batches" }]}
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
                New batch
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-lg overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Create inventory batch</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Product SKU</Label>
                  <SkuPicker value={sku} onValueChange={setSku} placeholder="Search SKU…" />
                </div>
                <div>
                  <Label>Warehouse</Label>
                  <SearchableSelect
                    value={warehouseId}
                    onValueChange={setWarehouseId}
                    options={warehouseOptions}
                    placeholder="Default warehouse"
                    searchPlaceholder="Search warehouses…"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Batch number</Label>
                    <Input
                      value={batchNumber}
                      onChange={(e) => setBatchNumber(e.target.value.toUpperCase())}
                      placeholder="Auto-generated if empty"
                      className="font-mono"
                    />
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min={0}
                      step="0.001"
                      value={qty}
                      onChange={(e) => setQty(Number(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Manufactured</Label>
                    <Input type="date" value={manufacturedAt} onChange={(e) => setManufacturedAt(e.target.value)} />
                  </div>
                  <div>
                    <Label>Expiry</Label>
                    <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
              </div>
              <SheetFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => void handleCreate()} disabled={createBatch.isPending || !sku.trim()}>
                  {createBatch.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create batch
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        }
      />

      <Card>
        <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              {STATUS_TABS.map((t) => (
                <TabsTrigger key={t.value} value={t.value}>
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Search batch, SKU, product…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Active batches
            <Badge variant="secondary" className="font-normal">
              {data?.pagination?.total ?? batches.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading && (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          )}
          {isError && (
            <p className="p-6 text-sm text-destructive">Failed to load batches. Check API connection.</p>
          )}
          {!isLoading && !isError && batches.length === 0 && (
            <EmptyState
              icon={Layers}
              title="No batches found"
              description="Register a batch to track lot numbers and expiry."
            />
          )}
          {!isLoading && !isError && batches.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {b.batch_number}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{b.product_name ?? "—"}</TableCell>
                    <TableCell className="font-mono text-xs">{b.sku}</TableCell>
                    <TableCell>{b.warehouse_name ?? "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">{b.qty_on_hand}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(b.expiry_date)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(batchStatusClass(b.status))}>
                        {b.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {(isLoading || isFetching) && batches.length > 0 && (
            <p className="px-4 py-2 text-xs text-muted-foreground">Refreshing…</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
