import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useInventoryWarehouses } from "@/hooks/inventory/use-inventory-warehouses";
import { useStockLevels, useStockMovements } from "@/hooks/inventory/use-stock-movements";
import { Warehouse, Activity, PackageCheck, ArrowRightLeft } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export function WarehouseDashboardPage() {
  const { data: warehousesData } = useInventoryWarehouses();
  const { data: levelsData } = useStockLevels();
  const { data: movementsData } = useStockMovements({ per_page: 100 });

  const warehouses = warehousesData?.data ?? [];
  const levels = levelsData?.data ?? [];
  const movements = movementsData?.data ?? [];

  const stockByWarehouse = useMemo(() => {
    const map = new Map<number, number>();
    for (const level of levels) {
      map.set(level.warehouse_id, (map.get(level.warehouse_id) ?? 0) + level.qty_on_hand);
    }
    return map;
  }, [levels]);

  const chartData = warehouses.map((w) => ({
    name: w.code,
    stock: stockByWarehouse.get(w.id) ?? 0,
  }));

  const totalStock = chartData.reduce((s, d) => s + d.stock, 0);
  const inbound = movements.filter((m) => m.quantity_delta > 0).length;
  const outbound = movements.filter((m) => m.quantity_delta < 0).length;
  const maxStock = Math.max(...chartData.map((d) => d.stock), 1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Multi-warehouse dashboard"
        description="Cross-facility stock totals and utilization."
        breadcrumbs={[{ label: "Inventory" }, { label: "Multi-warehouse" }]}
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link to="/app/inv/warehouses">Manage warehouses</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active warehouses" value={String(warehouses.filter((w) => w.status === "active").length)} icon={Warehouse} />
        <StatCard label="Total units" value={totalStock.toLocaleString()} icon={PackageCheck} accent="bg-success" />
        <StatCard label="Inbound moves" value={String(inbound)} icon={Activity} />
        <StatCard label="Outbound moves" value={String(outbound)} icon={ArrowRightLeft} trend="down" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stock by warehouse</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {chartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="stock" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Units" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No stock data yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Utilization (relative)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {warehouses.length ? (
              warehouses.map((w) => {
                const stock = stockByWarehouse.get(w.id) ?? 0;
                const pct = Math.round((stock / maxStock) * 100);
                return (
                  <div key={w.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{w.name}</span>
                      <span className="text-muted-foreground tabular-nums">
                        {stock.toLocaleString()} units
                      </span>
                    </div>
                    <Progress value={pct} />
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">No warehouses configured.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent movements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {movements.slice(0, 8).map((m) => (
            <div
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
            >
              <span className="font-mono text-xs">{m.sku}</span>
              <span className={m.quantity_delta < 0 ? "text-destructive" : "text-success"}>
                {m.quantity_delta > 0 ? "+" : ""}
                {m.quantity_delta}
              </span>
              <span className="text-muted-foreground">{m.movement_type.replace(/_/g, " ")}</span>
              <span className="text-xs text-muted-foreground">
                {m.created_at ? new Date(m.created_at).toLocaleString() : ""}
              </span>
            </div>
          ))}
          {!movements.length ? (
            <p className="text-sm text-muted-foreground">No movements recorded yet.</p>
          ) : null}
          <Button variant="link" className="px-0" asChild>
            <Link to="/app/inv/movements">View all movements</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
