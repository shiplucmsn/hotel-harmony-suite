import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Printer } from "lucide-react";
import { ledgerEntries, accounts } from "@/lib/finance-mock";

export const Route = createFileRoute("/app/finance/ledger")({ component: LedgerPage });

function LedgerPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="General Ledger"
        description="Detailed account-level transaction history."
        breadcrumbs={[{ label: "Finance" }, { label: "Ledger" }]}
        actions={<>
          <Button variant="outline" size="sm"><Printer className="mr-2 h-4 w-4" />Print</Button>
          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export</Button>
        </>}
      />

      <Card className="p-3 flex flex-wrap items-center gap-2">
        <Select defaultValue="all">
          <SelectTrigger className="w-64"><SelectValue placeholder="Select account" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All accounts</SelectItem>
            {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.code} — {a.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="date" className="w-44" />
        <Input type="date" className="w-44" />
        <Select defaultValue="all">
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All entries</SelectItem>
            <SelectItem value="debit">Debits</SelectItem>
            <SelectItem value="credit">Credits</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Date</TableHead><TableHead>Account</TableHead>
              <TableHead>Reference</TableHead><TableHead>Description</TableHead>
              <TableHead className="text-right">Debit</TableHead><TableHead className="text-right">Credit</TableHead>
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ledgerEntries.map(l => (
              <TableRow key={l.id}>
                <TableCell>{l.date}</TableCell>
                <TableCell className="font-medium">{l.account}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{l.reference}</TableCell>
                <TableCell>{l.description}</TableCell>
                <TableCell className="text-right tabular-nums">{l.debit ? `$${l.debit.toLocaleString()}` : "—"}</TableCell>
                <TableCell className="text-right tabular-nums">{l.credit ? `$${l.credit.toLocaleString()}` : "—"}</TableCell>
                <TableCell className="text-right font-semibold tabular-nums">${l.balance.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
