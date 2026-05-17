import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/shared/components/data-table/data-table";
import { PaginationBar } from "@/modules/finance/components/pagination-bar";
import { InventoryFilters } from "@/modules/inventory/components/inventory-filters";
import { MovementTypeBadge } from "@/modules/inventory/components/movement-type-badge";
import { StockAdjustmentSheet } from "@/modules/inventory/components/stock-adjustment-sheet";
import { useStockMovements } from "@/hooks/inventory/use-stock-movements";
import { useInventoryWarehouses } from "@/hooks/inventory/use-inventory-warehouses";
import type { StockMovementDto } from "@/modules/inventory/types";
import { paginateClient } from "@/modules/finance/utils";

const MOVEMENT_TYPES = [
  { value: "all", label: "All types" },
  { value: "adjustment", label: "Adjustment" },
  { value: "in", label: "Receipt" },
  { value: "out", label: "Issue" },
  { value: "purchase_receipt", label: "Purchase" },
  { value: "sales_issue", label: "Sale" },
  { value: "transfer_in", label: "Transfer in" },
  { value: "transfer_out", label: "Transfer out" },
];

export function StockMovementsPage() {
  const [search, setSearch] = useState("");
  const [movementType, setMovementType] = useState("all");
  const [warehouseId, setWarehouseId] = useState("all");
  const [page, setPage] = useState(1);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const perPage = 20;

  const { data: warehousesData } = useInventoryWarehouses();
  const warehouses = warehousesData?.data ?? [];

  const { data: result, isLoading } = useStockMovements({
    per_page: 200,
    movement_type: movementType === "all" ? undefined : movementType,
    warehouse_id: warehouseId === "all" ? undefined : Number(warehouseId),
  });

  const movements = result?.data ?? [];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return movements.filter(
      (m) =>
        !q ||
        m.sku.toLowerCase().includes(q) ||
        (m.reference_type ?? "").toLowerCase().includes(q) ||
        (m.notes ?? "").toLowerCase().includes(q),
    );
  }, [movements, search]);

  const { data: rows, pagination } = useMemo(
    () => paginateClient(filtered, page, perPage),
    [filtered, page, perPage],
  );

  const warehouseOptions = [
    { value: "all", label: "All warehouses" },
    ...warehouses.map((w) => ({ value: String(w.id), label: w.name })),
  ];

  const columns: DataTableColumn<StockMovementDto>[] = [
    {
      id: "sku",
      header: "SKU",
      cell: (m) => <span className="font-mono text-xs font-medium">{m.sku}</span>,
    },
    {
      id: "type",
      header: "Type",
      cell: (m) => <MovementTypeBadge type={m.movement_type} delta={m.quantity_delta} />,
    },
    {
      id: "qty",
      header: "Change",
      className: "text-right",
      cell: (m) => (
        <span
          className={
            m.quantity_delta < 0 ? "font-semibold text-destructive tabular-nums" : "font-semibold text-success tabular-nums"
          }
        >
          {m.quantity_delta > 0 ? "+" : ""}
          {m.quantity_delta}
        </span>
      ),
    },
    {
      id: "balance",
      header: "Before → After",
      className: "hidden md:table-cell",
      cell: (m) => (
        <span className="text-sm text-muted-foreground tabular-nums">
          {m.qty_before} → {m.qty_after}
        </span>
      ),
    },
    {
      id: "wh",
      header: "WH",
      className: "hidden lg:table-cell",
      cell: (m) => (m.warehouse_id ? `#${m.warehouse_id}` : "—"),
    },
    {
      id: "ref",
      header: "Reference",
      className: "hidden lg:table-cell",
      cell: (m) => (
        <span className="text-xs text-muted-foreground">
          {m.reference_type ?? "—"}
          {m.reference_id ? ` · ${m.reference_id}` : ""}
        </span>
      ),
    },
    {
      id: "date",
      header: "Date",
      cell: (m) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {m.created_at ? new Date(m.created_at).toLocaleString() : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Stock movements"
        description="Ledger of receipts, issues, adjustments and transfers."
        breadcrumbs={[{ label: "Inventory" }, { label: "Stock movements" }]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/inv/adjustments">Adjustments</Link>
            </Button>
            <Button
              size="sm"
              className="gradient-primary border-0 text-primary-foreground"
              onClick={() => setAdjustOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              New adjustment
            </Button>
          </div>
        }
      />

      <InventoryFilters
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search SKU, reference, notes…"
        movementType={movementType}
        onMovementTypeChange={(v) => {
          setMovementType(v);
          setPage(1);
        }}
        movementTypeOptions={MOVEMENT_TYPES}
        warehouseId={warehouseId}
        onWarehouseChange={(v) => {
          setWarehouseId(v);
          setPage(1);
        }}
        warehouseOptions={warehouseOptions}
      />

      <Card className="p-3 md:p-4">
        <DataTable
          columns={columns}
          data={rows}
          loading={isLoading}
          emptyTitle="No movements"
          emptyDescription="Stock changes will appear here after receipts, sales, or adjustments."
          getRowId={(m) => String(m.id)}
        />
        {pagination.total > 0 ? (
          <PaginationBar pagination={pagination} onPageChange={setPage} className="mt-4" />
        ) : null}
      </Card>

      <StockAdjustmentSheet open={adjustOpen} onOpenChange={setAdjustOpen} />
    </div>
  );
}
