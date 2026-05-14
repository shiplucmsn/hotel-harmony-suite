import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { transactions } from "@/lib/finance-mock";
import { EmptyState } from "@/components/empty-state";

export const Route = createFileRoute("/app/finance/transactions")({ component: TransactionsPage });

const statusColor: Record<string, string> = {
  cleared: "bg-success/15 text-success border-success/20",
  pending: "bg-warning/15 text-warning border-warning/20",
  failed: "bg-destructive/15 text-destructive border-destructive/20",
};

function TransactionsPage() {
  const [q, setQ] = useState("");
  const filtered = transactions.filter(t => t.description.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        description="All bank, card and wallet transactions."
        breadcrumbs={[{ label: "Finance" }, { label: "Transactions" }]}
        actions={<Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export CSV</Button>}
      />

      <Card className="p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search transactions…" className="pl-9" />
        </div>
        <Input type="date" className="w-44" />
        <Input type="date" className="w-44" />
        <Select defaultValue="all"><SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="credit">Credits</SelectItem>
            <SelectItem value="debit">Debits</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all"><SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            {Object.keys(statusColor).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm"><Filter className="mr-2 h-4 w-4" />More</Button>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState title="No transactions" description="Try adjusting your filters or date range." />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Date</TableHead><TableHead>Description</TableHead>
                <TableHead>Account</TableHead><TableHead>Category</TableHead>
                <TableHead>Type</TableHead><TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(t => (
                <TableRow key={t.id}>
                  <TableCell>{t.date}</TableCell>
                  <TableCell className="font-medium">{t.description}</TableCell>
                  <TableCell className="text-muted-foreground">{t.account}</TableCell>
                  <TableCell>{t.category}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={t.type === "credit" ? "bg-success/15 text-success border-success/20" : "bg-info/15 text-info border-info/20"}>{t.type}</Badge>
                  </TableCell>
                  <TableCell className={`text-right font-semibold tabular-nums ${t.type === "debit" ? "text-destructive" : "text-success"}`}>
                    {t.type === "debit" ? "-" : "+"}${t.amount.toLocaleString()}
                  </TableCell>
                  <TableCell><Badge variant="outline" className={statusColor[t.status]}>{t.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
            <span className="text-muted-foreground">Showing 1–{filtered.length} of {transactions.length}</span>
            <div className="flex gap-1">
              <Button size="sm" variant="outline"><ChevronLeft className="h-4 w-4" /></Button>
              <Button size="sm" variant="outline"><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
