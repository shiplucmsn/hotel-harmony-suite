import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { StatCard } from "@/components/stat-card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Plus, Download, MoreHorizontal, Pencil, Trash2, DollarSign, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { incomes } from "@/lib/finance-mock";

export const Route = createFileRoute("/app/finance/income")({ component: IncomePage });

const statusColor: Record<string, string> = {
  received: "bg-success/15 text-success border-success/20",
  pending: "bg-warning/15 text-warning border-warning/20",
  overdue: "bg-destructive/15 text-destructive border-destructive/20",
};

function IncomePage() {
  const [q, setQ] = useState("");
  const filtered = incomes.filter(i => i.source.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Income Tracking"
        description="Record and categorize all incoming revenue streams."
        breadcrumbs={[{ label: "Finance" }, { label: "Income" }]}
        actions={<>
          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export</Button>
          <Dialog>
            <DialogTrigger asChild><Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="mr-2 h-4 w-4" />Add income</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Record income</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div><Label>Source</Label><Input placeholder="Customer name" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Amount</Label><Input type="number" placeholder="0.00" /></div>
                  <div><Label>Date</Label><Input type="date" /></div>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{["Service","Subscription","License","Consulting","Other"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter><Button variant="outline">Cancel</Button><Button className="gradient-primary text-primary-foreground border-0">Save</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="This month" value="$40,300" change="+14.2%" icon={DollarSign} />
        <StatCard label="Received" value="$30,700" change="+10.8%" icon={TrendingUp} accent="bg-success" />
        <StatCard label="Pending" value="$6,200" icon={Clock} accent="bg-warning" />
        <StatCard label="Overdue" value="$3,400" trend="down" icon={AlertTriangle} accent="bg-destructive" />
      </div>

      <Card className="p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search source…" className="pl-9" />
        </div>
        <Input type="date" className="w-44" />
        <Input type="date" className="w-44" />
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Number</TableHead><TableHead>Date</TableHead><TableHead>Source</TableHead>
              <TableHead>Category</TableHead><TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead><TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(i => (
              <TableRow key={i.id}>
                <TableCell className="font-mono text-xs">{i.number}</TableCell>
                <TableCell>{i.date}</TableCell>
                <TableCell className="font-medium">{i.source}</TableCell>
                <TableCell>{i.category}</TableCell>
                <TableCell className="text-right font-semibold tabular-nums">${i.amount.toLocaleString()}</TableCell>
                <TableCell><Badge variant="outline" className={statusColor[i.status]}>{i.status}</Badge></TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button size="sm" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
