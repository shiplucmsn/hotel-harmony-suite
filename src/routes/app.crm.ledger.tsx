import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Filter } from "lucide-react";
import { ledgerEntries, customers } from "@/lib/crm-mock";

export const Route = createFileRoute("/app/crm/ledger")({
  component: () => (
    <div className="space-y-6">
      <PageHeader
        title="Customer Ledger"
        description="Per-customer statement of account with running balance."
        breadcrumbs={[{ label: "CRM & Sales" }, { label: "Customer Ledger" }]}
        actions={<Button variant="outline"><Download className="h-4 w-4 mr-2" />Export PDF</Button>}
      />

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-4">
            <Select><SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger><SelectContent>{customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
            <Input type="date" />
            <Input type="date" />
            <Button variant="outline"><Filter className="h-4 w-4 mr-2" />Apply</Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border p-4"><div className="text-xs text-muted-foreground">Total Debit</div><div className="text-xl font-semibold mt-1">$184,400</div></div>
            <div className="rounded-xl border p-4"><div className="text-xs text-muted-foreground">Total Credit</div><div className="text-xl font-semibold mt-1">$60,000</div></div>
            <div className="rounded-xl border p-4 bg-primary/5"><div className="text-xs text-muted-foreground">Outstanding</div><div className="text-xl font-semibold mt-1 text-primary">$124,400</div></div>
          </div>

          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Reference</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Debit</TableHead><TableHead className="text-right">Credit</TableHead><TableHead className="text-right">Balance</TableHead></TableRow></TableHeader>
              <TableBody>
                {ledgerEntries.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="text-muted-foreground">{e.date}</TableCell>
                    <TableCell className="font-medium">{e.reference}</TableCell>
                    <TableCell>{e.description}</TableCell>
                    <TableCell className="text-right">{e.debit ? `$${e.debit.toLocaleString()}` : "—"}</TableCell>
                    <TableCell className="text-right">{e.credit ? `$${e.credit.toLocaleString()}` : "—"}</TableCell>
                    <TableCell className="text-right font-semibold">${e.balance.toLocaleString()}</TableCell>
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
