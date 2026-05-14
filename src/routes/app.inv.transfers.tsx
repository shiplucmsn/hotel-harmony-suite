import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { transfers, warehouses, statusTone } from "@/lib/inventory-mock";
import { Plus, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/inv/transfers")({ component: TransfersPage });

function TransfersPage() {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-6">
      <PageHeader title="Stock Transfer" description="Move inventory between warehouses." breadcrumbs={[{ label: "Inventory" }, { label: "Stock Transfer" }]}
        actions={
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild><Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-2" />New transfer</Button></SheetTrigger>
            <SheetContent className="sm:max-w-lg">
              <SheetHeader><SheetTitle>Create stock transfer</SheetTitle></SheetHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>From</Label>
                    <Select><SelectTrigger><SelectValue placeholder="Source" /></SelectTrigger>
                      <SelectContent>{warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
                    </Select></div>
                  <div><Label>To</Label>
                    <Select><SelectTrigger><SelectValue placeholder="Destination" /></SelectTrigger>
                      <SelectContent>{warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
                    </Select></div>
                </div>
                <div><Label>Expected date</Label><Input type="date" /></div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-sm font-medium mb-2">Items</p>
                  <div className="grid grid-cols-3 gap-2"><Input placeholder="SKU" /><Input placeholder="Qty" type="number" /><Button variant="outline" size="sm">+ Add</Button></div>
                </div>
                <div><Label>Notes</Label><Input placeholder="Reference / notes" /></div>
              </div>
              <SheetFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={() => { setOpen(false); toast.success("Transfer created"); }}>Create transfer</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        }
      />

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Number</TableHead><TableHead>Route</TableHead><TableHead>Items</TableHead><TableHead>Qty</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {transfers.map(t => (
              <TableRow key={t.id}>
                <TableCell className="font-mono text-xs">{t.number}</TableCell>
                <TableCell><span className="inline-flex items-center gap-2 text-sm"><span className="font-medium">{t.from}</span><ArrowRightLeft className="h-3 w-3 text-muted-foreground" /><span className="font-medium">{t.to}</span></span></TableCell>
                <TableCell>{t.items}</TableCell>
                <TableCell>{t.qty}</TableCell>
                <TableCell className="text-muted-foreground">{t.date}</TableCell>
                <TableCell><Badge variant="outline" className={statusTone(t.status)}>{t.status.replace("_", " ")}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
