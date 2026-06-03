import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, Layers, Loader2, Package, RefreshCw, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatCard } from "@/components/stat-card";
import { PaginationBar } from "@/modules/finance/components/pagination-bar";
import {
  useProductionFinishedGoods,
  useProductionFinishedGoodsOutputHistory,
} from "@/hooks/production/use-production";

function stockTone(status: string) {
  if (status === "ok") return "bg-success/15 text-success border-success/30";
  if (status === "low") return "bg-warning/15 text-warning border-warning/30";
  return "bg-destructive/15 text-destructive border-destructive/30";
}

function stockLabel(status: string) {
  if (status === "ok") return "In stock";
  if (status === "low") return "Low";
  return "Out";
}

function formatMoney(value: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(value);
}

export function FinishedGoodsPage() {
  const [tab, setTab] = useState("products");
  const [fgPage, setFgPage] = useState(1);
  const [outPage, setOutPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [bomStatus, setBomStatus] = useState<"active" | "inactive" | "all">("all");
  const [lowOnly, setLowOnly] = useState(false);

  const fgParams = useMemo(
    () => ({
      page: fgPage,
      per_page: 20,
      search: search || undefined,
      bom_status: bomStatus,
      stock_status: lowOnly ? ("low" as const) : undefined,
    }),
    [fgPage, search, bomStatus, lowOnly],
  );

  const outParams = useMemo(
    () => ({
      page: outPage,
      per_page: 25,
      search: tab === "output" ? search || undefined : undefined,
    }),
    [outPage, search, tab],
  );

  const {
    data: fgData,
    isLoading: fgLoading,
    isError: fgError,
    isFetching: fgFetching,
    refetch: refetchFg,
  } = useProductionFinishedGoods(fgParams);

  const {
    data: outData,
    isLoading: outLoading,
    isError: outError,
    isFetching: outFetching,
    refetch: refetchOut,
  } = useProductionFinishedGoodsOutputHistory(outParams);

  const finishedProducts = fgData?.data ?? [];
  const fgSummary = fgData?.summary;
  const fgPagination = fgData?.pagination;

  const productionOutput = outData?.data ?? [];
  const outSummary = outData?.summary;
  const outPagination = outData?.pagination;

  const applySearch = () => {
    setSearch(searchInput.trim());
    setFgPage(1);
    setOutPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finished Goods"
        description="BOM output products (single product master) and completed production run history from work orders."
        breadcrumbs={[{ label: "Production" }, { label: "Finished Goods" }]}
      />

      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v);
          setOutPage(1);
          setFgPage(1);
        }}
      >
        <TabsList>
          <TabsTrigger value="products">Finished products (BOM output)</TabsTrigger>
          <TabsTrigger value="output">Production output history</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4 mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Finished SKUs" value={String(fgSummary?.total_skus ?? finishedProducts.length)} icon={Package} />
            <StatCard label="Low stock" value={String(fgSummary?.low_stock ?? 0)} icon={AlertTriangle} />
            <StatCard
              label="Inventory value"
              value={formatMoney(fgSummary?.inventory_value ?? 0)}
              icon={Layers}
            />
            <StatCard label="Total on hand" value={String(fgSummary?.total_stock_qty ?? 0)} icon={Package} />
          </div>

          <Card>
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-end">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applySearch()}
                  placeholder="Search SKU or name…"
                />
              </div>
              <Select value={bomStatus} onValueChange={(v) => setBomStatus(v as typeof bomStatus)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="BOM status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All BOMs</SelectItem>
                  <SelectItem value="active">Active BOM only</SelectItem>
                  <SelectItem value="inactive">Inactive BOM</SelectItem>
                </SelectContent>
              </Select>
              <Button variant={lowOnly ? "default" : "outline"} size="sm" onClick={() => setLowOnly((v) => !v)}>
                Low stock only
              </Button>
              <Button variant="secondary" onClick={applySearch}>
                Search
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => refetchFg()}
                disabled={fgFetching}
                aria-label="Refresh"
              >
                <RefreshCw className={`h-4 w-4 ${fgFetching ? "animate-spin" : ""}`} />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              {fgLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : fgError ? (
                <div className="p-6">
                  <EmptyState
                    title="Could not load finished products"
                    action={
                      <Button variant="outline" onClick={() => refetchFg()}>
                        Retry
                      </Button>
                    }
                  />
                </div>
              ) : finishedProducts.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={Package}
                    title="No finished products"
                    description="Create a BOM with a finished product SKU (product master). Finished goods are not a separate table."
                    action={
                      <Button asChild>
                        <Link to="/app/prod/bom">Go to BOM</Link>
                      </Button>
                    }
                  />
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>BOMs</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {finishedProducts.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell>
                            {p.stock} {p.uom}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {(p.bom_codes ?? []).join(", ") || p.bom_output_count}
                          </TableCell>
                          <TableCell>{formatMoney(p.cost_price)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={stockTone(p.status)}>
                              {stockLabel(p.status)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {fgPagination && fgPagination.lastPage > 1 && (
                    <div className="border-t p-3">
                      <PaginationBar
                        page={fgPagination.page}
                        lastPage={fgPagination.lastPage}
                        total={fgPagination.total}
                        onPageChange={setFgPage}
                      />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="output" className="space-y-4 mt-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Output lines" value={String(outSummary?.total_lines ?? productionOutput.length)} icon={Layers} />
            <StatCard label="Total quantity produced" value={String(outSummary?.total_qty ?? 0)} icon={Package} />
            <StatCard label="Output value (cost)" value={formatMoney(outSummary?.total_cost ?? 0)} icon={Layers} />
          </div>

          <Card>
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applySearch()}
                  placeholder="Search WO, SKU, product…"
                />
              </div>
              <Button variant="secondary" onClick={applySearch}>
                Search
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => refetchOut()}
                disabled={outFetching}
                aria-label="Refresh"
              >
                <RefreshCw className={`h-4 w-4 ${outFetching ? "animate-spin" : ""}`} />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              {outLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : outError ? (
                <div className="p-6">
                  <EmptyState
                    title="Could not load output history"
                    action={
                      <Button variant="outline" onClick={() => refetchOut()}>
                        Retry
                      </Button>
                    }
                  />
                </div>
              ) : productionOutput.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={Package}
                    title="No production output yet"
                    description="Complete a work order to post finished goods into inventory and appear here."
                    action={
                      <Button asChild>
                        <Link to="/app/prod/work-orders">Work orders</Link>
                      </Button>
                    }
                  />
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Work order</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Unit cost</TableHead>
                        <TableHead>Line cost</TableHead>
                        <TableHead>Completed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productionOutput.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-mono text-xs">
                            <Link
                              to="/app/prod/work-orders"
                              className="text-primary hover:underline"
                              title="View work orders"
                            >
                              {row.work_order_number ?? row.batch}
                            </Link>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{row.sku}</TableCell>
                          <TableCell>{row.product_name}</TableCell>
                          <TableCell>{row.qty ?? row.actual_qty}</TableCell>
                          <TableCell>{formatMoney(row.unit_cost)}</TableCell>
                          <TableCell>{formatMoney(row.line_cost ?? row.cost)}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {row.date ?? (row.completed_at ? new Date(row.completed_at).toLocaleDateString() : "—")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {outPagination && outPagination.lastPage > 1 && (
                    <div className="border-t p-3">
                      <PaginationBar
                        page={outPagination.page}
                        lastPage={outPagination.lastPage}
                        total={outPagination.total}
                        onPageChange={setOutPage}
                      />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">
            Output comes from completed work orders (inventory <code>production_in</code> movement). Manage recipes in{" "}
            <Link to="/app/prod/bom" className="text-primary underline">
              BOM
            </Link>
            .
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
