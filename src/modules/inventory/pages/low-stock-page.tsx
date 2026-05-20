import { useDeferredValue, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, Bell, Loader2, Search, ShoppingBag, ShoppingCart } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useDispatchLowStockAlerts,
  useInventoryLowStockList,
  useInventoryLowStockSummary,
} from "@/hooks/inventory/use-inventory-low-stock";
import { cn } from "@/lib/utils";

const SEVERITY_TABS = [
  { value: "all", label: "All alerts" },
  { value: "out_of_stock", label: "Out of stock" },
  { value: "low", label: "Low stock" },
] as const;

function severityBadgeClass(severity: string): string {
  return severity === "out_of_stock"
    ? "bg-destructive/15 text-destructive border-destructive/30"
    : "bg-warning/15 text-warning border-warning/30";
}

function severityLabel(severity: string): string {
  return severity === "out_of_stock" ? "Out of stock" : "Low";
}

export function LowStockPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<string>("all");
  const deferredSearch = useDeferredValue(search);

  const listParams = useMemo(
    () => ({
      per_page: 100,
      search: deferredSearch || undefined,
      severity: tab === "all" ? undefined : tab,
    }),
    [deferredSearch, tab],
  );

  const { data: summary, isLoading: summaryLoading } = useInventoryLowStockSummary();
  const { data: listRes, isLoading: listLoading, isFetching } = useInventoryLowStockList(listParams);
  const dispatchAlerts = useDispatchLowStockAlerts();

  const rows = listRes?.data ?? [];
  const loading = listLoading || isFetching;
  const totalAlerts = summary?.total_alerts ?? rows.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Low Stock Alerts"
        description="Warehouse stock levels at or below each product's reorder point."
        breadcrumbs={[{ label: "Inventory" }, { label: "Low stock" }]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={dispatchAlerts.isPending || totalAlerts === 0}
              onClick={() => dispatchAlerts.mutate()}
            >
              {dispatchAlerts.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Bell className="mr-2 h-4 w-4" />
              )}
              Send alerts now
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link to="/app/inv/purchase-orders">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Purchase orders
              </Link>
            </Button>
          </div>
        }
      />

      {summaryLoading ? (
        <Skeleton className="h-20" />
      ) : (
        <Card className="border-warning/40 bg-warning/5">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <div className="flex-1">
              <p className="font-medium">
                {totalAlerts} stock alert{totalAlerts === 1 ? "" : "s"} below reorder threshold
              </p>
              <p className="text-xs text-muted-foreground">
                {summary?.out_of_stock ?? 0} out of stock · {summary?.low_stock ?? 0} low ·{" "}
                {summary?.unique_products ?? 0} product{summary?.unique_products === 1 ? "" : "s"} affected
              </p>
            </div>
            <Button size="sm" className="gradient-primary border-0 text-primary-foreground" asChild>
              <Link to="/app/inv/purchase-orders">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Create PO
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Items needing reorder</CardTitle>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                {SEVERITY_TABS.map((t) => (
                  <TabsTrigger key={t.value} value={t.value}>
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search product, SKU, warehouse…"
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading low stock alerts…
            </div>
          ) : rows.length === 0 ? (
            <EmptyState
              icon={AlertTriangle}
              title="No low stock alerts"
              description="Stock is above reorder points for all tracked products, or no stock levels exist yet."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Stock level</TableHead>
                  <TableHead>Reorder at</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const isOut = row.severity === "out_of_stock";
                  const pct = row.fill_percent ?? 0;
                  return (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.product_name ?? "—"}</TableCell>
                      <TableCell className="font-mono text-xs">{row.sku}</TableCell>
                      <TableCell>{row.warehouse_name ?? "—"}</TableCell>
                      <TableCell className="w-48">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span
                              className={cn(
                                "font-medium",
                                isOut ? "text-destructive" : "text-warning",
                              )}
                            >
                              {row.qty_on_hand}
                            </span>
                            <span className="text-muted-foreground">/ {row.reorder_point}</span>
                          </div>
                          <Progress value={pct} />
                        </div>
                      </TableCell>
                      <TableCell>{row.reorder_point}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={severityBadgeClass(row.severity)}>
                          {severityLabel(row.severity)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
