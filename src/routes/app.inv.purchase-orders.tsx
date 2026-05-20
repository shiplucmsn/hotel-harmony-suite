import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SkuPicker } from "@/shared/components/forms/sku-picker";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { purchaseOrders, statusTone, purchaseTrend } from "@/lib/inventory-mock";
import { Plus, MoreHorizontal, ShoppingBag, DollarSign, Package, Clock, Trash2 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/app/inv/purchase-orders")({ component: POPage });

function POPage() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([{ sku: "", qty: 1, price: 0 }]);
  const total = items.reduce((a, i) => a + i.qty * i.price, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Purchase Orders" description="Procurement requests to suppliers." breadcrumbs={[{ label: "Purchases" }, { label: "Orders" }]}
        actions={
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild><Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-2" />New PO</Button></SheetTrigger>
            <SheetContent className="sm:max-w-2xl overflow-y-auto">
              <SheetHeader><SheetTitle>Create purchase order</SheetTitle></SheetHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-3"><div><Label>Supplier</Label><Input placeholder="Select supplier…" /></div><div><Label>Warehouse</Label><Input placeholder="Receiving location…" /></div></div>
                <div className="grid grid-cols-2 gap-3"><div><Label>Order date</Label><Input type="date" /></div><div><Label>Expected</Label><Input type="date" /></div></div>
                <Card><CardContent className="p-3">
                  <div className="flex items-center justify-between mb-3"><Label>Line items</Label><Button size="sm" variant="outline" onClick={() => setItems([...items, { sku: "", qty: 1, price: 0 }])}>+ Add line</Button></div>
                  <div className="space-y-2">
                    {items.map((it, i) => (
                      <div key={i} className="grid grid-cols-12 gap-2 items-center">
                        <SkuPicker
                          className="col-span-5"
                          value={it.sku}
                          onValueChange={(sku) => {
                            const c = [...items];
                            c[i].sku = sku;
                            setItems(c);
                          }}
                          placeholder="Search SKU…"
                        />
                        <Input className="col-span-2" type="number" placeholder="Qty" value={it.qty} onChange={e => { const c = [...items]; c[i].qty = +e.target.value; setItems(c); }} />
                        <Input className="col-span-3" type="number" placeholder="Price" value={it.price} onChange={e => { const c = [...items]; c[i].price = +e.target.value; setItems(c); }} />
                        <div className="col-span-1 text-sm text-right">${(it.qty * it.price).toFixed(0)}</div>
                        <Button className="col-span-1" variant="ghost" size="icon" onClick={() => setItems(items.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t flex justify-between text-sm"><span className="font-medium">Total</span><span className="font-semibold">${total.toFixed(2)}</span></div>
                </CardContent></Card>
              </div>
              <SheetFooter><Button variant="outline" onClick={() => setOpen(false)}>Save draft</Button><Button onClick={() => { setOpen(false); toast.success("PO sent to supplier"); }}>Send PO</Button></SheetFooter>
            </SheetContent>
          </Sheet>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Open POs" value="14" change="+3" icon={ShoppingBag} />
        <StatCard label="Spend (mo)" value="$71.8K" change="+22.9%" icon={DollarSign} accent="bg-success" />
        <StatCard label="Items in transit" value="186" change="+8" icon={Package} />
        <StatCard label="Avg lead time" value="9 days" change="-0.6 days" icon={Clock} accent="bg-success" />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Purchase spend trend</CardTitle></CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={purchaseTrend}><CartesianGrid strokeDasharray="3 3" opacity={0.2} /><XAxis dataKey="month" /><YAxis /><Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} /><Bar dataKey="spend" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Tabs defaultValue="all">
        <TabsList><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="draft">Draft</TabsTrigger><TabsTrigger value="sent">Sent</TabsTrigger><TabsTrigger value="received">Received</TabsTrigger></TabsList>
        <TabsContent value="all" className="mt-4">
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>PO Number</TableHead><TableHead>Supplier</TableHead><TableHead>Date</TableHead><TableHead>Expected</TableHead><TableHead>Items</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {purchaseOrders.map(po => (
                  <TableRow key={po.id}>
                    <TableCell className="font-mono text-xs">{po.number}</TableCell>
                    <TableCell className="font-medium">{po.supplier}</TableCell>
                    <TableCell className="text-muted-foreground">{po.date}</TableCell>
                    <TableCell className="text-muted-foreground">{po.expected}</TableCell>
                    <TableCell>{po.items}</TableCell>
                    <TableCell className="font-semibold">${po.total.toLocaleString()}</TableCell>
                    <TableCell><Badge variant="outline" className={statusTone(po.status)}>{po.status}</Badge></TableCell>
                    <TableCell><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem>View</DropdownMenuItem><DropdownMenuItem>Receive (GRN)</DropdownMenuItem><DropdownMenuItem>Duplicate</DropdownMenuItem><DropdownMenuItem className="text-destructive">Cancel</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
