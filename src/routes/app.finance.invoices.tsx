import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StatCard } from "@/components/stat-card";
import { Search, Plus, Download, MoreHorizontal, Eye, Send, Trash2, FileText, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { invoices } from "@/lib/finance-mock";

export const Route = createFileRoute("/app/finance/invoices")({ component: FinanceInvoicesPage });

const statusColor: Record<string, string> = {
  paid: "bg-success/15 text-success border-success/20",
  sent: "bg-info/15 text-info border-info/20",
  overdue: "bg-destructive/15 text-destructive border-destructive/20",
  draft: "bg-muted text-muted-foreground",
};

function FinanceInvoicesPage() {
  const [q, setQ] = useState("");
  const filtered = invoices.filter(i =>
    i.number.toLowerCase().includes(q.toLowerCase()) || i.customer.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoice Accounting"
        description="Issue, track and reconcile customer invoices."
        breadcrumbs={[{ label: "Finance" }, { label: "Invoices" }]}
        actions={<>
          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export</Button>
          <Sheet>
            <SheetTrigger asChild><Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="mr-2 h-4 w-4" />New invoice</Button></SheetTrigger>
            <SheetContent className="sm:max-w-2xl overflow-y-auto">
              <SheetHeader><SheetTitle>Create invoice</SheetTitle></SheetHeader>
              <div className="mt-6 space-y-4">
                <div><Label>Customer</Label><Input placeholder="Search or add customer" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Issue date</Label><Input type="date" /></div>
                  <div><Label>Due date</Label><Input type="date" /></div>
                </div>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Item</TableHead><TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead><TableHead className="text-right">Total</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell><Input placeholder="Service description" /></TableCell>
                        <TableCell><Input type="number" placeholder="1" className="text-right" /></TableCell>
                        <TableCell><Input type="number" placeholder="0.00" className="text-right" /></TableCell>
                        <TableCell className="text-right font-medium">$0.00</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <Button variant="outline" size="sm" className="w-full"><Plus className="mr-2 h-4 w-4" />Add line</Button>
                <div className="rounded-lg border p-3 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>$0.00</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Tax (20%)</span><span>$0.00</span></div>
                  <div className="flex justify-between font-semibold pt-2 border-t"><span>Total</span><span>$0.00</span></div>
                </div>
              </div>
              <SheetFooter className="mt-6"><Button variant="outline">Save draft</Button><Button className="gradient-primary text-primary-foreground border-0"><Send className="mr-2 h-4 w-4" />Send invoice</Button></SheetFooter>
            </SheetContent>
          </Sheet>
        </>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total billed" value="$44,700" change="+12.6%" icon={FileText} />
        <StatCard label="Paid" value="$30,700" change="+8.2%" icon={CheckCircle2} accent="bg-success" />
        <StatCard label="Outstanding" value="$10,600" icon={Clock} accent="bg-warning" />
        <StatCard label="Overdue" value="$3,400" trend="down" icon={AlertTriangle} accent="bg-destructive" />
      </div>

      <Card className="p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search invoices…" className="pl-9" />
        </div>
        <Select defaultValue="all"><SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            {Object.keys(statusColor).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Number</TableHead><TableHead>Customer</TableHead><TableHead>Issued</TableHead>
              <TableHead>Due</TableHead><TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead><TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(i => (
              <TableRow key={i.id}>
                <TableCell className="font-mono text-xs">{i.number}</TableCell>
                <TableCell className="font-medium">{i.customer}</TableCell>
                <TableCell>{i.issueDate}</TableCell>
                <TableCell>{i.dueDate}</TableCell>
                <TableCell className="text-right font-semibold tabular-nums">${i.amount.toLocaleString()}</TableCell>
                <TableCell><Badge variant="outline" className={statusColor[i.status]}>{i.status}</Badge></TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button size="sm" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem>
                      <DropdownMenuItem><Send className="mr-2 h-4 w-4" />Send reminder</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Void</DropdownMenuItem>
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
