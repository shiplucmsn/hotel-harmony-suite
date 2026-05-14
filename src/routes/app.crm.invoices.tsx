import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, MoreHorizontal, Download, Send, Printer } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { crmInvoices } from "@/lib/crm-mock";

const variant: Record<string, string> = {
  paid: "bg-success/10 text-success",
  partial: "bg-info/10 text-info",
  due: "bg-warning/10 text-warning",
  overdue: "bg-destructive/10 text-destructive",
  draft: "bg-muted text-muted-foreground",
};

export const Route = createFileRoute("/app/crm/invoices")({
  component: () => (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Issue and reconcile invoices for your customers."
        breadcrumbs={[{ label: "CRM & Sales" }, { label: "Invoices" }]}
        actions={<Button className="gradient-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-2" />New Invoice</Button>}
      />

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search invoices..." className="pl-9" />
          </div>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Invoice #</TableHead><TableHead>Customer</TableHead><TableHead className="hidden md:table-cell">Issued</TableHead><TableHead className="hidden md:table-cell">Due</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="text-right hidden sm:table-cell">Paid</TableHead><TableHead className="w-10" /></TableRow></TableHeader>
              <TableBody>
                {crmInvoices.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild><button className="font-medium hover:underline">{i.number}</button></DialogTrigger>
                        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
                          <InvoicePreview number={i.number} customer={i.customer} amount={i.amount} status={i.status} />
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    <TableCell>{i.customer}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{i.issued}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{i.due}</TableCell>
                    <TableCell><Badge className={variant[i.status]}>{i.status}</Badge></TableCell>
                    <TableCell className="text-right font-semibold">${i.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-right hidden sm:table-cell">${i.paid.toLocaleString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end"><DropdownMenuItem>Preview</DropdownMenuItem><DropdownMenuItem>Send</DropdownMenuItem><DropdownMenuItem>Mark as paid</DropdownMenuItem><DropdownMenuItem className="text-destructive">Void</DropdownMenuItem></DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
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

function InvoicePreview({ number, customer, amount, status }: { number: string; customer: string; amount: number; status: string }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 border-b p-4">
        <h2 className="text-lg font-semibold">Invoice {number}</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline"><Printer className="h-4 w-4 mr-2" />Print</Button>
          <Button size="sm" variant="outline"><Download className="h-4 w-4 mr-2" />PDF</Button>
          <Button size="sm" className="gradient-primary text-primary-foreground border-0"><Send className="h-4 w-4 mr-2" />Send</Button>
        </div>
      </div>
      <div className="p-8 space-y-6 bg-card">
        <div className="flex items-start justify-between">
          <div>
            <div className="h-10 w-10 rounded-lg gradient-primary mb-3" />
            <div className="font-semibold">Nebula ERP, Inc.</div>
            <div className="text-xs text-muted-foreground">123 Market St · San Francisco, CA</div>
            <div className="text-xs text-muted-foreground">billing@nebula.io</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{number}</div>
            <Badge className="mt-1">{status}</Badge>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div><div className="text-xs uppercase text-muted-foreground mb-1">Bill to</div><div className="font-medium">{customer}</div><div className="text-muted-foreground">accounts@{customer.toLowerCase().replace(/ /g, "")}.io</div></div>
          <div className="text-right"><div className="text-xs uppercase text-muted-foreground mb-1">Issued / Due</div><div>Nov 1, 2025</div><div className="text-muted-foreground">Dec 1, 2025</div></div>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-xs uppercase text-muted-foreground"><th className="text-left py-2">Item</th><th className="text-right py-2">Qty</th><th className="text-right py-2">Price</th><th className="text-right py-2">Total</th></tr></thead>
          <tbody>
            <tr className="border-b"><td className="py-3">Annual subscription · Enterprise plan</td><td className="text-right">1</td><td className="text-right">${(amount * 0.9).toLocaleString()}</td><td className="text-right font-medium">${(amount * 0.9).toLocaleString()}</td></tr>
            <tr className="border-b"><td className="py-3">Premium support add-on</td><td className="text-right">1</td><td className="text-right">${(amount * 0.1).toLocaleString()}</td><td className="text-right font-medium">${(amount * 0.1).toLocaleString()}</td></tr>
          </tbody>
        </table>
        <div className="flex justify-end">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${(amount * 0.91).toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax (10%)</span><span>${(amount * 0.09).toLocaleString()}</span></div>
            <div className="flex justify-between border-t pt-2 font-semibold text-base"><span>Total</span><span>${amount.toLocaleString()}</span></div>
          </div>
        </div>
        <div className="rounded-lg bg-muted/50 p-4 text-xs text-muted-foreground">Payment due within 30 days. Wire to IBAN GB29 NWBK 6016 1331 9268 19. Thank you for your business.</div>
      </div>
    </div>
  );
}
