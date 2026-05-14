import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatCard } from "@/components/stat-card";
import { TableSkeleton } from "@/components/loading-skeleton";
import { Search, Download, CreditCard, RotateCcw, XCircle, CheckCircle2, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import { payments } from "@/lib/finance-mock";

export const Route = createFileRoute("/app/finance/payments")({ component: PaymentsPage });

const statusColor: Record<string, string> = {
  succeeded: "bg-success/15 text-success border-success/20",
  refunded: "bg-info/15 text-info border-info/20",
  failed: "bg-destructive/15 text-destructive border-destructive/20",
};

function PaymentsPage() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 600); return () => clearTimeout(t); }, []);
  const filtered = payments.filter(p => p.customer.toLowerCase().includes(q.toLowerCase()) || p.invoice.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment History"
        description="All received and refunded payments across methods."
        breadcrumbs={[{ label: "Finance" }, { label: "Payments" }]}
        actions={<Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Volume" value="$32,800" change="+9.4%" icon={CreditCard} />
        <StatCard label="Succeeded" value="$31,360" change="+11.2%" icon={CheckCircle2} accent="bg-success" />
        <StatCard label="Refunded" value="$1,200" icon={RotateCcw} accent="bg-info" />
        <StatCard label="Failed" value="$240" trend="down" icon={XCircle} accent="bg-destructive" />
      </div>

      <Card className="p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search invoice or customer…" className="pl-9" />
        </div>
        <Input type="date" className="w-44" />
        <Input type="date" className="w-44" />
        <Select defaultValue="all"><SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All methods</SelectItem>
            {["Card","Bank","Wire","Cash","Wallet"].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm"><Filter className="mr-2 h-4 w-4" />Filters</Button>
      </Card>

      {loading ? (
        <Card className="p-4"><TableSkeleton rows={6} /></Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Date</TableHead><TableHead>Invoice</TableHead><TableHead>Customer</TableHead>
                <TableHead>Method</TableHead><TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => (
                <TableRow key={p.id}>
                  <TableCell>{p.date}</TableCell>
                  <TableCell className="font-mono text-xs">{p.invoice}</TableCell>
                  <TableCell className="font-medium">{p.customer}</TableCell>
                  <TableCell>{p.method}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">${p.amount.toLocaleString()}</TableCell>
                  <TableCell><Badge variant="outline" className={statusColor[p.status]}>{p.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
