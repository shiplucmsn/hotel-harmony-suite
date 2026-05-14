import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { products } from "@/lib/inventory-mock";
import { Printer, Download, ScanBarcode } from "lucide-react";

export const Route = createFileRoute("/app/inv/barcode")({ component: BarcodePage });

function BarcodePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Barcode Manager" description="Generate, print and scan product barcodes." breadcrumbs={[{ label: "Inventory" }, { label: "Barcodes" }]}
        actions={<><Button variant="outline" size="sm"><ScanBarcode className="h-4 w-4 mr-2" />Scan</Button><Button size="sm" className="gradient-primary text-primary-foreground border-0"><Printer className="h-4 w-4 mr-2" />Print sheet</Button></>}
      />

      <Card>
        <CardHeader><CardTitle className="text-base">Lookup by SKU</CardTitle></CardHeader>
        <CardContent><div className="flex gap-2"><Input placeholder="Enter SKU or scan barcode…" /><Button>Search</Button></div></CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map(p => (
          <Card key={p.id} className="overflow-hidden">
            <CardContent className="p-4 space-y-3 text-center">
              <div>
                <p className="text-xs text-muted-foreground">{p.sku}</p>
                <p className="font-medium text-sm truncate">{p.name}</p>
              </div>
              <div className="rounded-md bg-white p-3 border">
                <div className="flex items-end justify-center gap-px h-16">
                  {Array.from({ length: 38 }).map((_, i) => (
                    <div key={i} className="bg-black" style={{ width: i % 3 === 0 ? 3 : 1, height: `${50 + (i * 7) % 50}%` }} />
                  ))}
                </div>
                <p className="font-mono text-xs mt-2 tracking-widest text-black">{p.barcode}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" className="flex-1"><Download className="h-3 w-3" /></Button>
                <Button variant="outline" size="sm" className="flex-1"><Printer className="h-3 w-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
