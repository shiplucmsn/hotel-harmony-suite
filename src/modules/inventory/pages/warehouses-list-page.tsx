import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Plus, MapPin, LayoutDashboard } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/shared/components/data-table/data-table";
import { InventoryFilters } from "@/modules/inventory/components/inventory-filters";
import { WarehouseFormSheet } from "@/modules/inventory/components/warehouse-form-sheet";
import { useInventoryWarehouses } from "@/hooks/inventory/use-inventory-warehouses";
import { useStockLevels } from "@/hooks/inventory/use-stock-movements";
import type { WarehouseDto } from "@/modules/inventory/types";
import { Warehouse as WarehouseIcon, Boxes } from "lucide-react";
import { cn } from "@/lib/utils";

const statusTone: Record<string, string> = {
  active: "bg-success/15 text-success border-success/20",
  inactive: "bg-muted text-muted-foreground border-border",
};

export function WarehousesListPage() {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const { data: warehousesData, isLoading } = useInventoryWarehouses();
  const { data: levelsData } = useStockLevels();

  const warehouses = warehousesData?.data ?? [];
  const stockByWarehouse = useMemo(() => {
    const map: Record<number, number> = {};
    for (const level of levelsData?.data ?? []) {
      map[level.warehouse_id] = (map[level.warehouse_id] ?? 0) + level.qty_on_hand;
    }
    return map;
  }, [levelsData]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return warehouses.filter(
      (w) =>
        !q ||
        w.name.toLowerCase().includes(q) ||
        w.code.toLowerCase().includes(q) ||
        (w.location ?? "").toLowerCase().includes(q),
    );
  }, [warehouses, search]);

  const totalStock = Object.values(stockByWarehouse).reduce((a, b) => a + b, 0);

  const columns: DataTableColumn<WarehouseDto>[] = [
    {
      id: "name",
      header: "Warehouse",
      cell: (w) => (
        <div>
          <p className="font-medium">{w.name}</p>
          <p className="font-mono text-xs text-muted-foreground">{w.code}</p>
        </div>
      ),
    },
    {
      id: "location",
      header: "Location",
      className: "hidden sm:table-cell",
      cell: (w) => (
        <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {w.location ?? "—"}
        </span>
      ),
    },
    {
      id: "stock",
      header: "Units on hand",
      className: "text-right",
      cell: (w) => (
        <span className="font-semibold tabular-nums">{(stockByWarehouse[w.id] ?? 0).toLocaleString()}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (w) => (
        <Badge variant="outline" className={cn(statusTone[w.status] ?? statusTone.active)}>
          {w.status}
        </Badge>
      ),
    },
    {
      id: "default",
      header: "",
      className: "text-right",
      cell: (w) =>
        w.is_default ? (
          <Badge variant="secondary" className="text-xs">
            Default
          </Badge>
        ) : null,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Warehouses"
        description="Facilities and multi-warehouse stock locations."
        breadcrumbs={[{ label: "Inventory" }, { label: "Warehouses" }]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/inv/warehouses-dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button
              size="sm"
              className="gradient-primary border-0 text-primary-foreground"
              onClick={() => setFormOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              New warehouse
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Warehouses" value={String(warehouses.length)} icon={WarehouseIcon} />
        <StatCard label="Total units" value={totalStock.toLocaleString()} icon={Boxes} accent="bg-success" />
      </div>

      <InventoryFilters
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search name, code, location…"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((w) => (
          <Card key={w.id} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{w.name}</CardTitle>
                <Badge variant="outline" className={cn(statusTone[w.status] ?? statusTone.active)}>
                  {w.status}
                </Badge>
              </div>
              <p className="font-mono text-xs text-muted-foreground">{w.code}</p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                {w.location ?? "No location set"}
              </p>
              <p>
                <span className="text-muted-foreground">Stock: </span>
                <span className="font-semibold tabular-nums">{(stockByWarehouse[w.id] ?? 0).toLocaleString()} units</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="p-3 md:p-4">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-base">All warehouses</CardTitle>
        </CardHeader>
        <DataTable
          columns={columns}
          data={filtered}
          loading={isLoading}
          emptyTitle="No warehouses"
          emptyDescription="Create a warehouse to track stock by location."
          getRowId={(w) => String(w.id)}
        />
      </Card>

      <WarehouseFormSheet open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
