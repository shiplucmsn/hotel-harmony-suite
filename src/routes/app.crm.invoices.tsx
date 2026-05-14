import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Plus, Search, MoreHorizontal, Download, Send, Printer } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { crmInvoices } from "@/lib/crm-mock";
import { toast } from "sonner";

const variant: Record<string, string> = {
  paid: "bg-success/10 text-success",
  partial: "bg-info/10 text-info",
  due: "bg-warning/10 text-warning",
  overdue: "bg-destructive/10 text-destructive",
  draft: "bg-muted text-muted-foreground",
};

type CRMInvoice = (typeof crmInvoices)[number];
type InvoiceStatus = "paid" | "partial" | "due" | "overdue" | "draft";
type InvoiceForm = {
  number: string;
  customer: string;
  issued: string;
  due: string;
  amount: string;
  paid: string;
  status: InvoiceStatus;
  notes: string;
};

const emptyForm: InvoiceForm = {
  number: "",
  customer: "",
  issued: "",
  due: "",
  amount: "0",
  paid: "0",
  status: "draft",
  notes: "",
};

export const Route = createFileRoute("/app/crm/invoices")({ component: CRMInvoicesPage });

function CRMInvoicesPage() {
  const [invoices, setInvoices] = useState<CRMInvoice[]>(crmInvoices);
  const [q, setQ] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<CRMInvoice | null>(null);
  const [form, setForm] = useState<InvoiceForm>(emptyForm);

  const filtered = invoices.filter((i) => {
    const text = `${i.number} ${i.customer}`.toLowerCase();
    return text.includes(q.toLowerCase());
  });

  const createInvoice = () => {
    const next: CRMInvoice = {
      id: `${Date.now()}`,
      number: form.number.trim() || `CRM-INV-${String(Date.now()).slice(-5)}`,
      customer: form.customer.trim() || "Walk-in Customer",
      issued: form.issued || new Date().toISOString().slice(0, 10),
      due: form.due || new Date().toISOString().slice(0, 10),
      amount: Number(form.amount) || 0,
      paid: Number(form.paid) || 0,
      status: form.status,
    };
    setInvoices((prev) => [next, ...prev]);
    setSheetOpen(false);
    setForm(emptyForm);
    toast.success("Invoice created");
  };

  const setStatus = (id: string, status: InvoiceStatus) => {
    setInvoices((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              paid: status === "paid" ? item.amount : item.paid,
            }
          : item,
      ),
    );
  };

  const removeInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((item) => item.id !== id));
    toast.success("Invoice voided");
  };

  const openPreview = (invoice: CRMInvoice) => {
    setPreviewInvoice(invoice);
    setPreviewOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Issue and reconcile invoices for your customers."
        breadcrumbs={[{ label: "CRM & Sales" }, { label: "Invoices" }]}
        actions={
          <Button
            className="gradient-primary text-primary-foreground border-0"
            onClick={() => {
              setForm(emptyForm);
              setSheetOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        }
      />

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search invoices..." className="pl-9" />
          </div>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Invoice #</TableHead><TableHead>Customer</TableHead><TableHead className="hidden md:table-cell">Issued</TableHead><TableHead className="hidden md:table-cell">Due</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="text-right hidden sm:table-cell">Paid</TableHead><TableHead className="w-10" /></TableRow></TableHeader>
              <TableBody>
                {filtered.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>
                      <button className="font-medium hover:underline" onClick={() => openPreview(i)}>
                        {i.number}
                      </button>
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
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openPreview(i)}>
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setStatus(i.id, "due"); toast.success("Invoice sent"); }}>
                            Send
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setStatus(i.id, "paid"); toast.success("Invoice marked as paid"); }}>
                            Mark as paid
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => removeInvoice(i.id)}>
                            Void
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Create Invoice</SheetTitle>
          </SheetHeader>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Invoice Number</Label>
              <Input value={form.number} onChange={(e) => setForm((p) => ({ ...p, number: e.target.value }))} placeholder="e.g. CRM-INV-2026-001" />
            </div>
            <div className="grid gap-2">
              <Label>Customer</Label>
              <Input value={form.customer} onChange={(e) => setForm((p) => ({ ...p, customer: e.target.value }))} placeholder="Customer name" />
            </div>
            <div className="grid gap-2">
              <Label>Issued Date</Label>
              <Input type="date" value={form.issued} onChange={(e) => setForm((p) => ({ ...p, issued: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Due Date</Label>
              <Input type="date" value={form.due} onChange={(e) => setForm((p) => ({ ...p, due: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Total Amount</Label>
              <Input type="number" min={0} value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Paid Amount</Label>
              <Input type="number" min={0} value={form.paid} onChange={(e) => setForm((p) => ({ ...p, paid: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(value: InvoiceStatus) => setForm((p) => ({ ...p, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="due">Due</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label>Notes</Label>
              <Textarea rows={4} value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Invoice notes..." />
            </div>
          </div>
          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancel</Button>
            <Button className="gradient-primary text-primary-foreground border-0" onClick={createInvoice}>Create Invoice</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-4xl">
          <InvoicePreview invoice={previewInvoice} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InvoicePreview({ invoice }: { invoice: CRMInvoice | null }) {
  if (!invoice) return null;

  const subtotal = Math.round(invoice.amount * 0.9);
  const tax = invoice.amount - subtotal;
  const balance = Math.max(invoice.amount - invoice.paid, 0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b p-4">
        <h2 className="text-lg font-semibold">Invoice Preview - {invoice.number}</h2>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline"><Printer className="h-4 w-4 mr-2" />Print</Button>
          <Button size="sm" variant="outline"><Download className="h-4 w-4 mr-2" />PDF</Button>
          <Button size="sm" className="gradient-primary text-primary-foreground border-0"><Send className="h-4 w-4 mr-2" />Send</Button>
        </div>
      </div>
      <div className="space-y-6 bg-card p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="h-10 w-10 rounded-lg gradient-primary mb-3" />
            <div className="font-semibold">Nebula ERP, Inc.</div>
            <div className="text-xs text-muted-foreground">123 Market St · San Francisco, CA</div>
            <div className="text-xs text-muted-foreground">billing@nebula.io</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{invoice.number}</div>
            <Badge className={`mt-1 ${variant[invoice.status]}`}>{invoice.status}</Badge>
            <p className="mt-2 text-xs text-muted-foreground">Balance Due: ${balance.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid gap-6 text-sm md:grid-cols-2">
          <div>
            <div className="mb-1 text-xs uppercase text-muted-foreground">Bill To</div>
            <div className="font-medium">{invoice.customer}</div>
            <div className="text-muted-foreground">accounts@{invoice.customer.toLowerCase().replace(/ /g, "")}.com</div>
          </div>
          <div className="text-left md:text-right">
            <div className="mb-1 text-xs uppercase text-muted-foreground">Issued / Due</div>
            <div>{invoice.issued}</div>
            <div className="text-muted-foreground">{invoice.due}</div>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead><tr className="border-b text-xs uppercase text-muted-foreground"><th className="py-2 text-left">Item</th><th className="py-2 text-right">Qty</th><th className="py-2 text-right">Price</th><th className="py-2 text-right">Total</th></tr></thead>
          <tbody>
            <tr className="border-b"><td className="py-3">Hotel service package</td><td className="text-right">1</td><td className="text-right">${subtotal.toLocaleString()}</td><td className="text-right font-medium">${subtotal.toLocaleString()}</td></tr>
            <tr className="border-b"><td className="py-3">VAT / Tax adjustment</td><td className="text-right">1</td><td className="text-right">${tax.toLocaleString()}</td><td className="text-right font-medium">${tax.toLocaleString()}</td></tr>
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-full space-y-2 text-sm md:w-72">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>${tax.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Paid</span><span>${invoice.paid.toLocaleString()}</span></div>
            <div className="flex justify-between border-t pt-2 text-base font-semibold"><span>Total</span><span>${invoice.amount.toLocaleString()}</span></div>
            <div className="flex justify-between font-semibold text-warning"><span>Balance Due</span><span>${balance.toLocaleString()}</span></div>
          </div>
        </div>

        <div className="rounded-lg bg-muted/50 p-4 text-xs text-muted-foreground">
          Payment due by {invoice.due}. Please include invoice number {invoice.number} in payment reference.
        </div>
      </div>
    </div>
  );
}
