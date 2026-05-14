import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { products } from "@/lib/inventory-mock";
import { AlertTriangle, ShoppingCart, BellRing } from "lucide-react";

export const Route = createFileRoute("/app/inv/low-stock")({ component: LowStockPage });

function LowStockPage() {
  const low = products.filter(p => p.stock < p.reorder);
  return (
    <div className="space-y-6">
      <PageHeader title="Low Stock Alerts" description="Items that need reordering soon." breadcrumbs={[{ label: "Inventory" }, { label: "Low stock" }]}
        actions={<Button size="sm" variant="outline"><BellRing className="h-4 w-4 mr-2" />Alert settings</Button>}
      />

      <Card className="border-warning/40 bg-warning/5">
        <CardContent className="p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <div className="flex-1"><p className="font-medium">{low.length} products below reorder threshold</p><p className="text-xs text-muted-foreground">Generate purchase orders to replenish stock.</p></div>
          <Button size="sm" className="gradient-primary text-primary-foreground border-0"><ShoppingCart className="h-4 w-4 mr-2" />Auto-generate POs</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Items needing reorder</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>SKU</TableHead><TableHead>Warehouse</TableHead><TableHead>Stock level</TableHead><TableHead>Reorder at</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
            <TableBody>
              {low.map(p => {
                const pct = Math.min(100, Math.round(p.stock / p.reorder * 100));
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium flex items-center gap-2"><span className="text-xl">{p.image}</span>{p.name}</TableCell>
                    <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                    <TableCell>{p.warehouse}</TableCell>
                    <TableCell className="w-48">
                      <div className="space-y-1"><div className="flex justify-between text-xs"><span className={p.stock === 0 ? "text-destructive font-medium" : "text-warning font-medium"}>{p.stock}</span><span className="text-muted-foreground">/ {p.reorder}</span></div><Progress value={pct} /></div>
                    </TableCell>
                    <TableCell>{p.reorder}</TableCell>
                    <TableCell><Badge variant="outline" className={p.stock === 0 ? "bg-destructive/15 text-destructive border-destructive/30" : "bg-warning/15 text-warning border-warning/30"}>{p.stock === 0 ? "Out of stock" : "Low"}</Badge></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
