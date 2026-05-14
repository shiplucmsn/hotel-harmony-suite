import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { vendorPayments, statusTone } from "@/lib/inventory-mock";
import { Plus, Wallet, Receipt, Clock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/inv/vendor-payments")({ component: PaymentsPage });

function PaymentsPage() {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-6">
      <PageHeader title="Vendor Payments" description="Record and schedule supplier payouts." breadcrumbs={[{ label: "Purchases" }, { label: "Payments" }]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-2" />Record payment</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Record vendor payment</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Supplier</Label><Input placeholder="Select supplier" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Amount</Label><Input type="number" /></div>
                  <div><Label>Date</Label><Input type="date" /></div>
                </div>
                <div><Label>Method</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="b">Bank transfer</SelectItem><SelectItem value="c">Card</SelectItem><SelectItem value="ch">Cheque</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Reference / notes</Label><Input /></div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => { setOpen(false); toast.success("Payment recorded"); }}>Save</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total paid (mo)" value="$23.4K" change="+12%" icon={Wallet} accent="bg-success" />
        <StatCard label="Open invoices" value="8" change="-2" icon={Receipt} trend="down" />
        <StatCard label="Scheduled" value="$7.8K" change="+1 payment" icon={Clock} accent="bg-warning" />
      </div>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Reference</TableHead><TableHead>Supplier</TableHead><TableHead>Method</TableHead><TableHead>Amount</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {vendorPayments.map(p => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs">{p.ref}</TableCell>
                <TableCell className="font-medium">{p.supplier}</TableCell>
                <TableCell className="text-muted-foreground">{p.method}</TableCell>
                <TableCell className="font-semibold">${p.amount.toLocaleString()}</TableCell>
                <TableCell className="text-muted-foreground">{p.date}</TableCell>
                <TableCell><Badge variant="outline" className={statusTone(p.status)}>{p.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
