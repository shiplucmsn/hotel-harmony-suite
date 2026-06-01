import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Package, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationBar } from "@/modules/finance/components/pagination-bar";
import {
  useProductionFinishedGoods,
  useProductionWorkOrders,
} from "@/hooks/production/use-production";

function stockTone(status: string) {
  if (status === "ok") return "bg-success/15 text-success border-success/30";
  if (status === "low") return "bg-warning/15 text-warning border-warning/30";
  return "bg-destructive/15 text-destructive border-destructive/30";
}

function formatMoney(value: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(value);
}

export function FinishedGoodsPage() {
  const [tab, setTab] = useState("products");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const { data: fgData, isLoading: fgLoading } = useProductionFinishedGoods({
    page,
    per_page: 20,
    search: search || undefined,
    bom_status: "active",
  });
  const finishedProducts = fgData?.data ?? [];
  const pagination = fgData?.pagination;

  const { data: woData, isLoading: woLoading } = useProductionWorkOrders({ per_page: 300 });
  const workOrders = woData?.data ?? [];

  const productionOutput = useMemo(() => {
    const rows: {
      id: string;
      sku: string;
      name: string;
      batch: string;
      qty: number;
      unitCost: number;
      date: string;
    }[] = [];

    for (const wo of workOrders) {
      if (wo.status !== "completed") continue;
      for (const output of wo.outputs) {
        if (output.actual_qty <= 0) continue;
        rows.push({
          id: `${wo.id}-${output.id}`,
          sku: output.sku,
          name: output.product_name ?? wo.bom_name ?? output.sku,
          batch: wo.number,
          qty: Number(output.actual_qty),
          unitCost: Number(output.unit_cost),
          date: wo.completed_at ? new Date(wo.completed_at).toLocaleDateString() : "-",
        });
      }
    }

    return rows;
  }, [workOrders]);

  const totalOutputQty = productionOutput.reduce((s, r) => s + r.qty, 0);

  const applySearch = () => {
    setSearch(searchInput.trim());
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finished Goods"
        description="Products defined as BOM outputs (single product master) plus production run history."
        breadcrumbs={[{ label: "Production" }, { label: "Finished Goods" }]}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="products">Finished products (BOM output)</TabsTrigger>
          <TabsTrigger value="output">Production output history</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4 mt-4">
          <Card>
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applySearch()}
                  placeholder="Search SKU or name…"
                />
              </div>
              <Button variant="secondary" onClick={applySearch}>
                Search
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              {fgLoading ? (
                <div className="p-8 text-sm text-muted-foreground">Loading…</div>
              ) : finishedProducts.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={Package}
                    title="No finished products"
                    description="Assign a finished product on a BOM (product master SKU). No separate finished-goods table."
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
                              {p.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {pagination && pagination.lastPage > 1 && (
                    <div className="border-t p-3">
                      <PaginationBar
                        page={pagination.page}
                        lastPage={pagination.lastPage}
                        total={pagination.total}
                        onPageChange={setPage}
                      />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="output" className="space-y-4 mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Completed output lines</p>
                <p className="text-2xl font-semibold">{productionOutput.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total quantity produced</p>
                <p className="text-2xl font-semibold">{totalOutputQty}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-0">
              {woLoading ? (
                <div className="p-8 text-sm text-muted-foreground">Loading…</div>
              ) : productionOutput.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={Package}
                    title="No production output yet"
                    description="Complete a work order to see output history here."
                  />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>WO</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit cost</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productionOutput.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-mono text-xs">{row.batch}</TableCell>
                        <TableCell className="font-mono text-xs">{row.sku}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.qty}</TableCell>
                        <TableCell>{formatMoney(row.unitCost)}</TableCell>
                        <TableCell className="text-muted-foreground">{row.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">
            Manage recipes in{" "}
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
