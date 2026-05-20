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
import type { StockMovementDto } from "@/modules/inventory/types";
import { paginateClient } from "@/modules/finance/utils";

export function AdjustmentsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const perPage = 20;

  const movementParams = { per_page: 200, movement_type: "adjustment" as const };

  const { data: result, isLoading, isFetching } = useStockMovements(movementParams);

  const movements = result?.data ?? [];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return movements.filter(
      (m) =>
        !q ||
        m.sku.toLowerCase().includes(q) ||
        (m.notes ?? "").toLowerCase().includes(q),
    );
  }, [movements, search]);

  const { data: rows, pagination } = useMemo(
    () => paginateClient(filtered, page, perPage),
    [filtered, page, perPage],
  );

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
      header: "Adjustment",
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
      id: "notes",
      header: "Notes",
      className: "hidden md:table-cell",
      cell: (m) => <span className="text-sm text-muted-foreground">{m.notes ?? "—"}</span>,
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
        title="Stock adjustment"
        description="Record inventory corrections and cycle counts."
        breadcrumbs={[{ label: "Inventory" }, { label: "Adjustments" }]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/inv/movements">All movements</Link>
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
        searchPlaceholder="Search SKU or notes…"
      />

      <Card className="p-3 md:p-4">
        <DataTable
          columns={columns}
          data={rows}
          loading={isLoading || isFetching}
          emptyTitle="No adjustments"
          emptyDescription="Create an adjustment to correct on-hand quantities."
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
