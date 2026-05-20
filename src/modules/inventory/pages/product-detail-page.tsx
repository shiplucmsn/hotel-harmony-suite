import { useMemo, useState } from "react";
import { Link, useParams, useSearch } from "@tanstack/react-router";
import { ArrowLeft, Pencil, ScanBarcode, Package, Warehouse } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable, type DataTableColumn } from "@/shared/components/data-table/data-table";
import { PageLoading } from "@/shared/components/feedback/page-loading";
import { BarcodeStrip } from "@/modules/inventory/components/barcode-strip";
import { ProductFormSheet } from "@/modules/inventory/components/product-form-sheet";
import { ProductStatusBadge } from "@/modules/inventory/components/product-status-badge";
import { MovementTypeBadge } from "@/modules/inventory/components/movement-type-badge";
import { StockAdjustmentSheet } from "@/modules/inventory/components/stock-adjustment-sheet";
import { useInventoryProduct } from "@/hooks/inventory/use-inventory-products";
import { useInventoryWarehouses } from "@/hooks/inventory/use-inventory-warehouses";
import { useStockLevels, useStockMovements } from "@/hooks/inventory/use-stock-movements";
import { formatMoney, productDisplayStatus } from "@/modules/inventory/utils";
import type { StockLevelDto, StockMovementDto } from "@/modules/inventory/types";

export function ProductDetailPage() {
  const { productId } = useParams({ from: "/app/products/$productId" });
  const { tab: tabSearch } = useSearch({ from: "/app/products/$productId" });
  const [editOpen, setEditOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const defaultTab = tabSearch === "movements" ? "movements" : "stock";

  const { data: product, isLoading, isError } = useInventoryProduct(productId);
  const { data: levelsData } = useStockLevels(
    product ? { product_id: product.id } : undefined,
  );
  const { data: movementsData, isLoading: movementsLoading } = useStockMovements(
    product ? { product_id: product.id, per_page: 50 } : undefined,
  );

  const stockLevels = product?.stock_levels?.length
    ? product.stock_levels
    : (levelsData?.data ?? []);

  const movements = movementsData?.data ?? [];
  const { data: warehousesData } = useInventoryWarehouses();
  const warehouseNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const w of warehousesData?.data ?? []) {
      map.set(w.id, w.name);
    }
    return map;
  }, [warehousesData?.data]);

  const totalAvailable = useMemo(
    () => stockLevels.reduce((sum, l) => sum + (l.available_qty ?? 0), 0),
    [stockLevels],
  );

  const levelColumns: DataTableColumn<StockLevelDto>[] = useMemo(
    () => [
      {
        id: "warehouse",
        header: "Warehouse",
        cell: (r) => (
          <span className="font-medium">{r.warehouse?.name ?? `WH #${r.warehouse_id}`}</span>
        ),
      },
      {
        id: "on_hand",
        header: "On hand",
        className: "text-right",
        cell: (r) => <span className="tabular-nums">{r.qty_on_hand}</span>,
      },
      {
        id: "reserved",
        header: "Reserved",
        className: "text-right hidden sm:table-cell",
        cell: (r) => <span className="tabular-nums">{r.qty_reserved}</span>,
      },
      {
        id: "available",
        header: "Available",
        className: "text-right",
        cell: (r) => <span className="font-semibold tabular-nums">{r.available_qty}</span>,
      },
    ],
    [],
  );

  const movementColumns: DataTableColumn<StockMovementDto>[] = useMemo(
    () => [
      {
        id: "warehouse",
        header: "Warehouse",
        className: "hidden sm:table-cell",
        cell: (m) => (
          <span className="text-sm">
            {m.warehouse?.name ??
              (m.warehouse_id ? warehouseNameById.get(m.warehouse_id) ?? `WH #${m.warehouse_id}` : "—")}
          </span>
        ),
      },
      {
        id: "type",
        header: "Type",
        cell: (m) => <MovementTypeBadge type={m.movement_type} delta={m.quantity_delta} />,
      },
      {
        id: "qty",
        header: "Qty",
        className: "text-right",
        cell: (m) => (
          <span
            className={
              m.quantity_delta < 0 ? "font-medium text-destructive tabular-nums" : "font-medium text-success tabular-nums"
            }
          >
            {m.quantity_delta > 0 ? "+" : ""}
            {m.quantity_delta}
          </span>
        ),
      },
      {
        id: "before",
        header: "Before → After",
        className: "hidden md:table-cell",
        cell: (m) => (
          <span className="text-sm text-muted-foreground tabular-nums">
            {m.qty_before} → {m.qty_after}
          </span>
        ),
      },
      {
        id: "ref",
        header: "Reference",
        className: "hidden lg:table-cell",
        cell: (m) => (
          <span className="font-mono text-xs text-muted-foreground">
            {m.reference_type ? `${m.reference_type}${m.reference_id ? ` #${m.reference_id}` : ""}` : "—"}
          </span>
        ),
      },
      {
        id: "date",
        header: "Date",
        cell: (m) => (
          <span className="text-sm text-muted-foreground">
            {m.created_at ? new Date(m.created_at).toLocaleString() : "—"}
          </span>
        ),
      },
    ],
    [warehouseNameById],
  );

  if (isLoading) return <PageLoading />;

  if (isError || !product) {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/app/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to products
          </Link>
        </Button>
        <Card className="p-8 text-center text-muted-foreground">Product not found.</Card>
      </div>
    );
  }

  const displayStatus = productDisplayStatus(product.stock, String(product.status));
  const barcode = product.barcode ?? product.sku;

  return (
    <div className="space-y-5">
      <PageHeader
        title={product.name}
        description={`SKU ${product.sku}`}
        breadcrumbs={[
          { label: "Inventory" },
          { label: "Products", to: "/app/products" },
          { label: product.name },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAdjustOpen(true)}>
              Adjust stock
            </Button>
            <Button
              size="sm"
              className="gradient-primary border-0 text-primary-foreground"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4" />
              Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {[
              { label: "SKU", value: product.sku },
              { label: "Category", value: product.category_ref?.name ?? product.category ?? "—" },
              { label: "Brand", value: product.brand ?? "—" },
              { label: "Status", value: <ProductStatusBadge status={displayStatus} /> },
              { label: "Total on-hand", value: String(product.stock) },
              {
                label: "Total available",
                value: String(Math.round(totalAvailable)),
              },
              { label: "Selling price", value: formatMoney(Number(product.price)) },
              { label: "Cost", value: formatMoney(Number(product.cost_price ?? 0)) },
              { label: "Unit", value: product.unit?.name ?? "—" },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
                <div className="mt-1 text-sm font-medium">{item.value}</div>
              </div>
            ))}
            {product.description ? (
              <div className="rounded-lg border p-3 sm:col-span-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Description</p>
                <p className="mt-1 text-sm">{product.description}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <ScanBarcode className="h-4 w-4" />
              Barcode
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <BarcodeStrip value={barcode} />
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link to="/app/inv/barcode" search={{ q: barcode }}>
                Open barcode scanner
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={defaultTab} key={defaultTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="stock">
            <Warehouse className="mr-2 h-4 w-4" />
            Stock by warehouse
          </TabsTrigger>
          <TabsTrigger value="movements">Movements</TabsTrigger>
        </TabsList>
        <TabsContent value="stock" className="mt-4">
          <Card className="p-3 md:p-4">
            <DataTable
              columns={levelColumns}
              data={stockLevels}
              emptyTitle="No stock levels"
              emptyDescription="Stock will appear after receipts or adjustments."
              getRowId={(r) => String(r.id)}
            />
          </Card>
        </TabsContent>
        <TabsContent value="movements" className="mt-4">
          <Card className="p-3 md:p-4">
            <DataTable
              columns={movementColumns}
              data={movements}
              loading={movementsLoading}
              emptyTitle="No movements"
              emptyDescription="Stock changes will appear here."
              getRowId={(m) => String(m.id)}
            />
          </Card>
        </TabsContent>
      </Tabs>

      <ProductFormSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        product={product}
      />
      <StockAdjustmentSheet open={adjustOpen} onOpenChange={setAdjustOpen} defaultSku={product.sku} />
    </div>
  );
}
