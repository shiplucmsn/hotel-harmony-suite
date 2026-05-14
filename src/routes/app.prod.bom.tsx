import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { boms, bomLines, prodTone } from "@/lib/production-mock";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Search, Plus, MoreHorizontal, Download, GitBranch } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/prod/bom")({ component: BOMPage });

function BOMPage() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [selected, setSelected] = useState(boms[0]);
  const filtered = boms.filter(b => b.product.toLowerCase().includes(q.toLowerCase()) || b.code.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bill of Materials"
        description="Component recipes that drive every production run."
        breadcrumbs={[{ label: "Production" }, { label: "BOM" }]}
        actions={
          <>
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-2" />New BOM</Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-lg overflow-y-auto">
                <SheetHeader><SheetTitle>Create Bill of Materials</SheetTitle></SheetHeader>
                <div className="space-y-4 py-4">
                  <div><Label>Code</Label><Input placeholder="BOM-A101" /></div>
                  <div><Label>Product</Label><Input placeholder="Aurora Pro Laptop" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Version</Label><Input placeholder="v1.0" /></div>
                    <div><Label>Status</Label><Input placeholder="draft" /></div>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">Add component lines after creation.</div>
                </div>
                <SheetFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button onClick={() => { setOpen(false); toast.success("BOM created"); }}>Save</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </>
        }
      />

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" value={q} onChange={e => setQ(e.target.value)} placeholder="Search BOM..." />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>BOM list</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Product</TableHead><TableHead>Version</TableHead><TableHead>Items</TableHead><TableHead>Cost</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {filtered.map(b => (
                  <TableRow key={b.id} onClick={() => setSelected(b)} className="cursor-pointer">
                    <TableCell className="font-mono text-xs">{b.code}</TableCell>
                    <TableCell className="font-medium">{b.product}</TableCell>
                    <TableCell><Badge variant="outline">{b.version}</Badge></TableCell>
                    <TableCell>{b.items}</TableCell>
                    <TableCell>${b.cost}</TableCell>
                    <TableCell><Badge variant="outline" className={prodTone(b.status)}>{b.status}</Badge></TableCell>
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

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2"><GitBranch className="h-4 w-4 text-primary" /><CardTitle className="text-base">{selected.code}</CardTitle></div>
            <p className="text-xs text-muted-foreground">{selected.product} · {selected.version}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {bomLines.map((l, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-2.5 text-sm">
                  <div>
                    <div className="font-medium">{l.component}</div>
                    <div className="text-xs text-muted-foreground">{l.qty} {l.uom}</div>
                  </div>
                  <div className="font-mono text-xs">${l.cost.toFixed(2)}</div>
                </div>
              ))}
              <div className="flex items-center justify-between border-t pt-3 text-sm font-semibold">
                <span>Total cost</span><span>${selected.cost}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDelete open={delOpen} onOpenChange={setDelOpen} title="Delete BOM?" description="This action cannot be undone." onConfirm={() => toast.success("Deleted")} />
    </div>
  );
}
