import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adjustments, statusTone } from "@/lib/inventory-mock";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/inv/adjustments")({ component: AdjustPage });

function AdjustPage() {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-6">
      <PageHeader title="Stock Adjustment" description="Record inventory corrections and counts." breadcrumbs={[{ label: "Inventory" }, { label: "Adjustments" }]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-2" />New adjustment</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create stock adjustment</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3"><div><Label>Warehouse</Label><Input /></div><div><Label>SKU</Label><Input /></div></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Reason</Label>
                    <Select><SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
                      <SelectContent><SelectItem value="d">Damage</SelectItem><SelectItem value="t">Theft</SelectItem><SelectItem value="c">Stock count</SelectItem><SelectItem value="o">Other</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div><Label>Quantity</Label><Input type="number" placeholder="±" /></div>
                </div>
                <div><Label>Notes</Label><Textarea rows={3} /></div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => { setOpen(false); toast.success("Adjustment recorded"); }}>Save</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Reference</TableHead><TableHead>Warehouse</TableHead><TableHead>Reason</TableHead><TableHead>Qty</TableHead><TableHead>By</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {adjustments.map(a => (
              <TableRow key={a.id}>
                <TableCell className="font-mono text-xs">{a.number}</TableCell>
                <TableCell>{a.warehouse}</TableCell>
                <TableCell className="text-muted-foreground">{a.reason}</TableCell>
                <TableCell><span className={`inline-flex items-center gap-1 font-medium ${a.qty < 0 ? "text-destructive" : "text-success"}`}>{a.qty < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}{a.qty > 0 ? "+" : ""}{a.qty}</span></TableCell>
                <TableCell>{a.by}</TableCell>
                <TableCell className="text-muted-foreground">{a.date}</TableCell>
                <TableCell><Badge variant="outline" className={statusTone(a.status)}>{a.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
