import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download } from "lucide-react";
import { accounts } from "@/lib/finance-mock";

export const Route = createFileRoute("/app/finance/trial-balance")({ component: TrialBalance });

function TrialBalance() {
  // simple split debit/credit demo
  const rows = accounts.filter(a => a.status === "active").map(a => {
    const isDebit = a.type === "Asset" || a.type === "Expense";
    return { ...a, debit: isDebit ? a.balance : 0, credit: !isDebit ? a.balance : 0 };
  });
  const td = rows.reduce((s, r) => s + r.debit, 0);
  const tc = rows.reduce((s, r) => s + r.credit, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trial Balance"
        description="Verify totals of debits and credits across accounts."
        breadcrumbs={[{ label: "Finance" }, { label: "Trial Balance" }]}
        actions={<Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export</Button>}
      />

      <Card className="p-3 flex flex-wrap items-center gap-2">
        <Input type="date" className="w-44" defaultValue="2026-05-01" />
        <Input type="date" className="w-44" defaultValue="2026-05-31" />
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Code</TableHead><TableHead>Account</TableHead><TableHead>Type</TableHead>
              <TableHead className="text-right">Debit</TableHead><TableHead className="text-right">Credit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs">{r.code}</TableCell>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell className="text-muted-foreground">{r.type}</TableCell>
                <TableCell className="text-right tabular-nums">{r.debit ? `$${r.debit.toLocaleString()}` : "—"}</TableCell>
                <TableCell className="text-right tabular-nums">{r.credit ? `$${r.credit.toLocaleString()}` : "—"}</TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted/40 font-semibold">
              <TableCell colSpan={3}>Totals</TableCell>
              <TableCell className="text-right tabular-nums">${td.toLocaleString()}</TableCell>
              <TableCell className="text-right tabular-nums">${tc.toLocaleString()}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
