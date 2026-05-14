import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { products } from "@/lib/inventory-mock";
import { Search, Layers } from "lucide-react";

export const Route = createFileRoute("/app/inv/batches")({ component: BatchPage });

function BatchPage() {
  const batched = products.filter(p => p.batch);
  return (
    <div className="space-y-6">
      <PageHeader title="Batch Tracking" description="Track lots and batch numbers across products." breadcrumbs={[{ label: "Inventory" }, { label: "Batches" }]}
        actions={<Button size="sm" className="gradient-primary text-primary-foreground border-0">+ New batch</Button>}
      />

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search batch number…" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Layers className="h-4 w-4 text-primary" />Active batches</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Batch</TableHead><TableHead>Product</TableHead><TableHead>SKU</TableHead><TableHead>Warehouse</TableHead><TableHead>Stock</TableHead><TableHead>Expiry</TableHead></TableRow></TableHeader>
            <TableBody>
              {batched.map(p => (
                <TableRow key={p.id}>
                  <TableCell><Badge variant="outline" className="font-mono">{p.batch}</Badge></TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                  <TableCell>{p.warehouse}</TableCell>
                  <TableCell>{p.stock}</TableCell>
                  <TableCell className="text-muted-foreground">{p.expiry}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
