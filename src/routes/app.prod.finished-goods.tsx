import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatCard } from "@/components/stat-card";
import { Package, Plus, Download, Warehouse } from "lucide-react";
import { useCompleteProductionWorkOrder, useProductionWorkOrders } from "@/hooks/production/use-production";
import { toast } from "sonner";

export const Route = createFileRoute("/app/prod/finished-goods")({ component: FinishedGoodsPage });

function FinishedGoodsPage() {
  const completeWorkOrder = useCompleteProductionWorkOrder();
  const { data, isLoading } = useProductionWorkOrders({ per_page: 300 });
  const workOrders = data?.data ?? [];

  const finishedGoods = useMemo(() => {
    const rows: {
      id: string;
      sku: string;
      name: string;
      batch: string;
      qty: number;
      warehouse: string;
      date: string;
      unitCost: number;
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
          warehouse: wo.warehouse_id ? `Warehouse #${wo.warehouse_id}` : "Default",
          date: wo.completed_at ? new Date(wo.completed_at).toLocaleDateString() : "-",
          unitCost: Number(output.unit_cost),
        });
      }
    }

    return rows;
  }, [workOrders]);

  const total = finishedGoods.reduce((s, item) => s + item.qty, 0);
  const avgCost = finishedGoods.length
    ? finishedGoods.reduce((s, item) => s + item.unitCost, 0) / finishedGoods.length
    : 0;
  const releasable = workOrders.find((wo) => wo.status === "in_progress" || wo.status === "released");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finished Goods"
        description="Production output ready for shipment or stocking."
        breadcrumbs={[{ label: "Production" }, { label: "Finished Goods" }]}
        actions={
          <>
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
            <Button
              size="sm"
              className="gradient-primary text-primary-foreground border-0"
              disabled={!releasable || completeWorkOrder.isPending}
              onClick={() => {
                if (!releasable) {
                  toast.message("No in-progress work order to receive.");
                  return;
                }
                completeWorkOrder.mutate({ id: releasable.id, body: { overhead_cost: 0 } });
              }}
            >
              <Plus className="h-4 w-4 mr-2" />Receive batch
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Units produced" value={total.toLocaleString()} icon={Package} />
        <StatCard label="Batches" value={String(new Set(finishedGoods.map((item) => item.batch)).size)} icon={Package} />
        <StatCard label="Avg unit cost" value={`$${avgCost.toFixed(2)}`} icon={Warehouse} />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-sm text-muted-foreground">Loading finished goods...</div>
          ) : finishedGoods.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Package}
                title="No finished goods yet"
                description="Complete a work order to receive finished goods into inventory."
              />
            </div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>SKU</TableHead><TableHead>Product</TableHead><TableHead>Batch</TableHead><TableHead>Qty</TableHead><TableHead>Unit Cost</TableHead><TableHead>Warehouse</TableHead><TableHead>Date</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {finishedGoods.map(f => (
                  <TableRow key={f.id}>
                    <TableCell className="font-mono text-xs">{f.sku}</TableCell>
                    <TableCell className="font-medium">{f.name}</TableCell>
                    <TableCell><Badge variant="outline">{f.batch}</Badge></TableCell>
                    <TableCell>{f.qty}</TableCell>
                    <TableCell>${f.unitCost.toFixed(4)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{f.warehouse}</TableCell>
                    <TableCell className="text-sm">{f.date}</TableCell>
                    <TableCell><Button variant="ghost" size="sm">Transfer</Button></TableCell>
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
