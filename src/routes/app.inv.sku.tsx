import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { products } from "@/lib/inventory-mock";
import { Hash, Wand2, Copy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/inv/sku")({ component: SkuPage });

function SkuPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="SKU System" description="Generate and manage stock-keeping units." breadcrumbs={[{ label: "Inventory" }, { label: "SKU" }]} />

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Wand2 className="h-4 w-4 text-primary" />SKU generator</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <div><label className="text-xs text-muted-foreground">Category prefix</label><Input defaultValue="ELEC" /></div>
            <div><label className="text-xs text-muted-foreground">Subcategory</label><Input defaultValue="LP" /></div>
            <div><label className="text-xs text-muted-foreground">Sequence</label><Input defaultValue="003" /></div>
            <div className="flex items-end"><Button className="w-full" onClick={() => toast.success("SKU generated: ELEC-LP-003")}>Generate</Button></div>
          </div>
          <div className="mt-4 rounded-lg border bg-muted/30 p-4 flex items-center justify-between">
            <code className="font-mono text-lg">ELEC-LP-003</code>
            <Button variant="ghost" size="sm" onClick={() => toast.success("Copied")}><Copy className="h-4 w-4 mr-2" />Copy</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Hash className="h-4 w-4 text-primary" />SKU registry</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>SKU</TableHead><TableHead>Product</TableHead><TableHead>Category</TableHead><TableHead>Warehouse</TableHead><TableHead>Stock</TableHead></TableRow></TableHeader>
            <TableBody>
              {products.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground">{p.category}</TableCell>
                  <TableCell>{p.warehouse}</TableCell>
                  <TableCell>{p.stock}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
