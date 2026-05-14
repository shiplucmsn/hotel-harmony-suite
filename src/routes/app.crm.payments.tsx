import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { DollarSign, Clock, AlertCircle } from "lucide-react";
import { payments } from "@/lib/crm-mock";

const variant: Record<string, string> = {
  received: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  failed: "bg-destructive/10 text-destructive",
};

export const Route = createFileRoute("/app/crm/payments")({
  component: () => (
    <div className="space-y-6">
      <PageHeader
        title="Payment Collection"
        description="Track received, pending and failed customer payments."
        breadcrumbs={[{ label: "CRM & Sales" }, { label: "Payments" }]}
        actions={
          <Dialog>
            <DialogTrigger asChild><Button className="gradient-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-2" />Record Payment</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                <div><Label>Customer</Label><Input placeholder="Northwind Co" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Amount</Label><Input type="number" placeholder="0.00" /></div>
                  <div><Label>Method</Label><Select><SelectTrigger><SelectValue placeholder="Bank Transfer" /></SelectTrigger><SelectContent><SelectItem value="bank">Bank Transfer</SelectItem><SelectItem value="card">Credit Card</SelectItem><SelectItem value="cash">Cash</SelectItem></SelectContent></Select></div>
                </div>
                <div><Label>Linked invoice</Label><Input placeholder="INV-5021" /></div>
                <div><Label>Notes</Label><Input /></div>
              </div>
              <DialogFooter><Button variant="outline">Cancel</Button><Button>Save Payment</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Collected this month" value="$108,400" change="+24%" icon={DollarSign} />
        <StatCard label="Pending" value="$50,000" icon={Clock} accent="bg-amber-500" />
        <StatCard label="Failed" value="$8,400" trend="down" change="-12%" icon={AlertCircle} accent="bg-rose-500" />
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search payments..." className="pl-9" />
          </div>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Reference</TableHead><TableHead>Customer</TableHead><TableHead className="hidden md:table-cell">Date</TableHead><TableHead className="hidden md:table-cell">Method</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.ref}</TableCell>
                    <TableCell>{p.customer}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{p.date}</TableCell>
                    <TableCell className="hidden md:table-cell">{p.method}</TableCell>
                    <TableCell><Badge className={variant[p.status]}>{p.status}</Badge></TableCell>
                    <TableCell className="text-right font-semibold">${p.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
});
