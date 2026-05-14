import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatCard } from "@/components/stat-card";
import { refunds } from "@/lib/pos-mock";
import { prodTone } from "@/lib/production-mock";
import { Search, Plus, Undo2, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/pos/refunds")({ component: RefundsPage });

function RefundsPage() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const filtered = refunds.filter(r => r.ref.toLowerCase().includes(q.toLowerCase()) || r.original.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-6">
      <PageHeader
        title="Refunds & Returns"
        description="Process customer refunds and product returns."
        breadcrumbs={[{ label: "POS" }, { label: "Refunds" }]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-2" />New refund</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create refund</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Original receipt</Label><Input placeholder="POS-2026-XXXXX" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Amount</Label><Input type="number" placeholder="0.00" /></div>
                  <div><Label>Method</Label>
                    <Select><SelectTrigger><SelectValue placeholder="Refund to" /></SelectTrigger>
                      <SelectContent><SelectItem value="card">Card</SelectItem><SelectItem value="cash">Cash</SelectItem><SelectItem value="wallet">Wallet</SelectItem></SelectContent>
                    </Select></div>
                </div>
                <div><Label>Reason</Label><Textarea placeholder="Why is this being refunded?" /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={() => { setOpen(false); toast.success("Refund created"); }}>Submit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Refunds (mo)" value="42" change="-6%" trend="down" icon={Undo2} />
        <StatCard label="Approved" value="34" change="+2" icon={CheckCircle2} />
        <StatCard label="Pending" value="6" icon={Clock} />
        <StatCard label="Refund rate" value="2.1%" change="-0.4%" trend="down" icon={AlertCircle} />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" value={q} onChange={e => setQ(e.target.value)} placeholder="Search refunds..." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Ref</TableHead><TableHead>Original receipt</TableHead><TableHead>Reason</TableHead><TableHead>Amount</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.ref}</TableCell>
                  <TableCell className="font-mono text-xs">{r.original}</TableCell>
                  <TableCell>{r.reason}</TableCell>
                  <TableCell className="font-medium">${r.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-sm">{r.date}</TableCell>
                  <TableCell><Badge variant="outline" className={prodTone(r.status === "rejected" ? "fail" : r.status === "approved" ? "active" : "pending")}>{r.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
