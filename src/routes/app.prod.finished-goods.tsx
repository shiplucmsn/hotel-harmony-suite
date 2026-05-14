import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatCard } from "@/components/stat-card";
import { finishedGoods } from "@/lib/production-mock";
import { Package, Plus, Download, Warehouse } from "lucide-react";

export const Route = createFileRoute("/app/prod/finished-goods")({ component: FinishedGoodsPage });

function FinishedGoodsPage() {
  const total = finishedGoods.reduce((s, f) => s + f.qty, 0);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Finished Goods"
        description="Production output ready for shipment or stocking."
        breadcrumbs={[{ label: "Production" }, { label: "Finished Goods" }]}
        actions={
          <>
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
            <Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-2" />Receive batch</Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Units produced" value={total.toLocaleString()} change="+18%" icon={Package} />
        <StatCard label="Batches" value={String(finishedGoods.length)} icon={Package} />
        <StatCard label="Warehouses used" value="2" icon={Warehouse} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>SKU</TableHead><TableHead>Product</TableHead><TableHead>Batch</TableHead><TableHead>Qty</TableHead><TableHead>Warehouse</TableHead><TableHead>Date</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>
              {finishedGoods.map(f => (
                <TableRow key={f.id}>
                  <TableCell className="font-mono text-xs">{f.sku}</TableCell>
                  <TableCell className="font-medium">{f.name}</TableCell>
                  <TableCell><Badge variant="outline">{f.batch}</Badge></TableCell>
                  <TableCell>{f.qty}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{f.warehouse}</TableCell>
                  <TableCell className="text-sm">{f.date}</TableCell>
                  <TableCell><Button variant="ghost" size="sm">Transfer</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
