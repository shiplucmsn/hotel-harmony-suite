import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { suppliers, supplierLedger } from "@/lib/inventory-mock";
import { Download, Printer } from "lucide-react";

export const Route = createFileRoute("/app/inv/supplier-ledger")({ component: LedgerPage });

function LedgerPage() {
  const s = suppliers[0];
  return (
    <div className="space-y-6">
      <PageHeader title="Supplier Ledger" description="Statement of accounts per supplier." breadcrumbs={[{ label: "Purchases" }, { label: "Ledger" }]}
        actions={<><Button variant="outline" size="sm"><Printer className="h-4 w-4 mr-2" />Print</Button><Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button></>}
      />

      <Card>
        <CardContent className="p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12"><AvatarFallback className="gradient-primary text-primary-foreground">{s.name.split(" ").map(n => n[0]).slice(0, 2).join("")}</AvatarFallback></Avatar>
            <div><p className="font-semibold">{s.name}</p><p className="text-xs text-muted-foreground">{s.email} · {s.country}</p></div>
          </div>
          <div className="flex items-center gap-3">
            <Select defaultValue="s1"><SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
              <SelectContent>{suppliers.map(x => <SelectItem key={x.id} value={x.id}>{x.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select defaultValue="3m"><SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="1m">Last month</SelectItem><SelectItem value="3m">Last 3m</SelectItem><SelectItem value="1y">Last year</SelectItem></SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-5"><p className="text-xs text-muted-foreground uppercase">Total purchases</p><p className="mt-2 text-2xl font-semibold">$32,620</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-xs text-muted-foreground uppercase">Total paid</p><p className="mt-2 text-2xl font-semibold text-success">$12,450</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-xs text-muted-foreground uppercase">Outstanding</p><p className="mt-2 text-2xl font-semibold text-warning">$20,170</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Statement of account</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Reference</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Debit</TableHead><TableHead className="text-right">Credit</TableHead><TableHead className="text-right">Balance</TableHead></TableRow></TableHeader>
            <TableBody>
              {supplierLedger.map((e, i) => (
                <TableRow key={i}>
                  <TableCell className="text-muted-foreground">{e.date}</TableCell>
                  <TableCell className="font-mono text-xs">{e.ref}</TableCell>
                  <TableCell>{e.desc}</TableCell>
                  <TableCell className="text-right">{e.debit ? `$${e.debit.toLocaleString()}` : "—"}</TableCell>
                  <TableCell className="text-right text-success">{e.credit ? `$${e.credit.toLocaleString()}` : "—"}</TableCell>
                  <TableCell className="text-right font-semibold">${e.balance.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
