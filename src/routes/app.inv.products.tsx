import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { products, statusTone } from "@/lib/inventory-mock";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Search, Plus, MoreHorizontal, LayoutGrid, List, Download, Filter } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/inv/products")({ component: ProductsPage });

function ProductsPage() {
  const [q, setQ] = useState("");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [open, setOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const filtered = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Management"
        description="Catalog of all products across warehouses."
        breadcrumbs={[{ label: "Inventory" }, { label: "Products" }]}
        actions={
          <>
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-2" />New product</Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-lg overflow-y-auto">
                <SheetHeader><SheetTitle>Create product</SheetTitle></SheetHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>SKU</Label><Input placeholder="ELEC-LP-002" /></div>
                    <div><Label>Barcode</Label><Input placeholder="8901234567890" /></div>
                  </div>
                  <div><Label>Name</Label><Input placeholder="Aurora Pro Laptop" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Category</Label>
                      <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent><SelectItem value="elec">Electronics</SelectItem><SelectItem value="app">Apparel</SelectItem></SelectContent>
                      </Select></div>
                    <div><Label>Warehouse</Label>
                      <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent><SelectItem value="m">Main DC</SelectItem><SelectItem value="s">South Hub</SelectItem></SelectContent>
                      </Select></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div><Label>Cost</Label><Input type="number" placeholder="0.00" /></div>
                    <div><Label>Price</Label><Input type="number" placeholder="0.00" /></div>
                    <div><Label>Stock</Label><Input type="number" placeholder="0" /></div>
                  </div>
                  <div><Label>Description</Label><Textarea rows={3} /></div>
                </div>
                <SheetFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button onClick={() => { setOpen(false); toast.success("Product created"); }}>Save product</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </>
        }
      />

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search SKU or name…" value={q} onChange={e => setQ(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-2" />Filters</Button>
              <div className="flex rounded-md border">
                <Button variant={view === "grid" ? "secondary" : "ghost"} size="sm" onClick={() => setView("grid")} className="rounded-r-none"><LayoutGrid className="h-4 w-4" /></Button>
                <Button variant={view === "table" ? "secondary" : "ghost"} size="sm" onClick={() => setView("table")} className="rounded-l-none"><List className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({filtered.length})</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="low">Low stock</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          {view === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(p => (
                <Card key={p.id} className="group hover:shadow-elegant transition-all hover:-translate-y-0.5 overflow-hidden">
                  <div className="aspect-square bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center text-6xl">{p.image}</div>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{p.sku}</p>
                      </div>
                      <Badge variant="outline" className={statusTone(p.status)}>{p.status}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-1">
                      <span className="font-semibold">${p.price}</span>
                      <span className={p.stock < p.reorder ? "text-warning" : "text-muted-foreground"}>Stock: {p.stock}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Product</TableHead><TableHead>SKU</TableHead><TableHead>Category</TableHead>
                    <TableHead>Warehouse</TableHead><TableHead>Stock</TableHead><TableHead>Price</TableHead>
                    <TableHead>Status</TableHead><TableHead></TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {filtered.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium flex items-center gap-2"><span className="text-2xl">{p.image}</span>{p.name}</TableCell>
                        <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                        <TableCell className="text-muted-foreground">{p.category}</TableCell>
                        <TableCell>{p.warehouse}</TableCell>
                        <TableCell className={p.stock < p.reorder ? "text-warning font-medium" : ""}>{p.stock}</TableCell>
                        <TableCell>${p.price}</TableCell>
                        <TableCell><Badge variant="outline" className={statusTone(p.status)}>{p.status}</Badge></TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View</DropdownMenuItem>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem>Duplicate</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => setDelOpen(true)}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <ConfirmDelete open={delOpen} onOpenChange={setDelOpen} title="Delete product?" description="This will remove the product from the catalog." />
      <div className="hidden"><Link to="/app/inv/products">x</Link></div>
    </div>
  );
}
