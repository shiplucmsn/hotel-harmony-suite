import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkuPicker } from "@/shared/components/forms/sku-picker";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { rawMaterials, prodTone } from "@/lib/production-mock";
import { SupplierSelect } from "@/modules/purchase/components/supplier-select";
import { Search, Plus, MoreHorizontal, Download, Filter } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/prod/raw-materials")({ component: RawMaterialsPage });

function RawMaterialsPage() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const filtered = rawMaterials.filter(r => r.name.toLowerCase().includes(q.toLowerCase()) || r.sku.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Raw Materials"
        description="Inventory of components consumed by production."
        breadcrumbs={[{ label: "Production" }, { label: "Raw Materials" }]}
        actions={
          <>
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-2" />Add material</Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-md overflow-y-auto">
                <SheetHeader><SheetTitle>Add raw material</SheetTitle></SheetHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>SKU</Label>
                      <SkuPicker placeholder="Search material SKU…" />
                    </div>
                    <div><Label>UoM</Label><Input placeholder="pcs / kg / L" /></div>
                  </div>
                  <div><Label>Name</Label><Input placeholder="Material name" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Stock</Label><Input type="number" /></div>
                    <div><Label>Reorder level</Label><Input type="number" /></div>
                  </div>
                  <div><Label>Unit cost</Label><Input type="number" placeholder="0.00" /></div>
                  <div className="space-y-1.5">
                    <Label>Preferred supplier</Label>
                    <SupplierSelect value={supplierId} onValueChange={setSupplierId} />
                  </div>
                </div>
                <SheetFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button onClick={() => { setOpen(false); toast.success("Material added"); }}>Save</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </>
        }
      />

      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" value={q} onChange={e => setQ(e.target.value)} placeholder="Search materials..." />
          </div>
          <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-2" />Filters</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>SKU</TableHead><TableHead>Name</TableHead><TableHead>Supplier</TableHead><TableHead>Stock</TableHead><TableHead>Reorder</TableHead><TableHead>Cost</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>
              {filtered.map(r => {
                const pct = r.reorder ? Math.min(100, Math.round((r.stock / (r.reorder * 2)) * 100)) : 0;
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.sku}</TableCell>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{r.supplier}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{r.stock} {r.uom}</span>
                        <Progress value={pct} className="h-1.5 w-20" />
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{r.reorder}</TableCell>
                    <TableCell>${r.cost}</TableCell>
                    <TableCell><Badge variant="outline" className={prodTone(r.status)}>{r.status}</Badge></TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success("PO created")}>Reorder</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
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
