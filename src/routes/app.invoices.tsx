import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, FileText, Plus, MoreHorizontal, Pencil, Send } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { showSideEffects, type ApiEnvelope } from "@/lib/api-meta";

export const Route = createFileRoute("/app/invoices")({ component: InvoicesPage });

type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

type InvoiceItem = {
  id: string;
  number: string;
  customer: string;
  issueDate: string;
  dueDate: string;
  paymentMethod: "cash" | "card" | "bank" | "mobile";
  amount: number;
  status: InvoiceStatus;
  notes?: string;
};

type InvoiceFormState = {
  number: string;
  customer: string;
  issueDate: string;
  dueDate: string;
  paymentMethod: InvoiceItem["paymentMethod"];
  amount: string;
  status: InvoiceStatus;
  notes: string;
};

const initialInvoices: InvoiceItem[] = [
  { id: "1", number: "INV-2026-2001", customer: "Bluewater Hotel", issueDate: "2026-05-01", dueDate: "2026-05-15", paymentMethod: "bank", amount: 48200, status: "sent", notes: "Corporate monthly billing" },
  { id: "2", number: "INV-2026-2002", customer: "Ayesha Rahman", issueDate: "2026-05-03", dueDate: "2026-05-10", paymentMethod: "mobile", amount: 9750, status: "paid", notes: "Suite booking and dinner" },
  { id: "3", number: "INV-2026-2003", customer: "Skyline Events", issueDate: "2026-04-20", dueDate: "2026-04-30", paymentMethod: "bank", amount: 25200, status: "overdue", notes: "Conference hall package" },
];

const statusTone: Record<InvoiceStatus, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  sent: "bg-info/15 text-info border-info/20",
  paid: "bg-success/15 text-success border-success/20",
  overdue: "bg-destructive/15 text-destructive border-destructive/20",
};

const emptyInvoiceForm: InvoiceFormState = {
  number: "",
  customer: "",
  issueDate: "",
  dueDate: "",
  paymentMethod: "cash",
  amount: "0",
  status: "draft",
  notes: "",
};

function InvoicesPage() {
  const [query, setQuery] = useState("");
  const [invoiceList, setInvoiceList] = useState<InvoiceItem[]>(initialInvoices);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [form, setForm] = useState<InvoiceFormState>(emptyInvoiceForm);
  const [reconciliation, setReconciliation] = useState<{ balanced: boolean; issues: string[] } | null>(null);

  const loadInvoices = async () => {
    try {
      const res = await api.get<ApiEnvelope<Record<string, unknown>[]> | Record<string, unknown>[]>("/v1/crm/invoices", {
        headers: { "X-Tenant-Id": "demo_tenant", "X-Request-Id": crypto.randomUUID() },
      });
      const rows = Array.isArray(res) ? res : (res.data ?? []);
      const mapped: InvoiceItem[] = rows.map((row) => ({
        id: String(row.id ?? ""),
        number: String(row.number ?? ""),
        customer: String(row.customer ?? ""),
        issueDate: String(row.issued ?? ""),
        dueDate: String(row.due ?? ""),
        paymentMethod: "cash",
        amount: Number(row.amount ?? 0),
        status: (String(row.status ?? "draft") as InvoiceStatus) || "draft",
        notes: "",
      }));
      setInvoiceList(mapped);
    } catch {
      setInvoiceList(initialInvoices);
    }
  };

  const loadReconciliation = async () => {
    try {
      const res = await api.get<ApiEnvelope<{ journal: { balanced: boolean }; issues: string[] }>>("/v1/reconciliation/summary", {
        headers: { "X-Tenant-Id": "demo_tenant", "X-Request-Id": crypto.randomUUID() },
      });
      setReconciliation({
        balanced: Boolean(res.data?.journal?.balanced),
        issues: res.data?.issues ?? [],
      });
    } catch {
      setReconciliation(null);
    }
  };

  useEffect(() => {
    void loadInvoices();
    void loadReconciliation();
  }, []);

  const filteredInvoices = invoiceList.filter((invoice) => {
    const text = `${invoice.number} ${invoice.customer}`.toLowerCase();
    return text.includes(query.toLowerCase());
  });

  const openCreateSheet = () => {
    setSheetMode("create");
    setSelectedInvoice(null);
    setForm(emptyInvoiceForm);
    setSheetOpen(true);
  };

  const openEditSheet = (invoice: InvoiceItem) => {
    setSheetMode("edit");
    setSelectedInvoice(invoice);
    setForm({
      number: invoice.number,
      customer: invoice.customer,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      paymentMethod: invoice.paymentMethod,
      amount: String(invoice.amount),
      status: invoice.status,
      notes: invoice.notes ?? "",
    });
    setSheetOpen(true);
  };

  const saveInvoice = async () => {
    const payload: InvoiceItem = {
      id: selectedInvoice?.id ?? `${Date.now()}`,
      number: form.number.trim() || `INV-${String(Date.now()).slice(-6)}`,
      customer: form.customer.trim() || "Walk-in Customer",
      issueDate: form.issueDate || new Date().toISOString().slice(0, 10),
      dueDate: form.dueDate || new Date().toISOString().slice(0, 10),
      paymentMethod: form.paymentMethod,
      amount: Number(form.amount) || 0,
      status: form.status,
      notes: form.notes,
    };

    try {
      if (sheetMode === "create") {
        const res = await api.post<ApiEnvelope<Record<string, unknown>>>(
          "/v1/crm/invoices",
          {
            number: payload.number,
            customer: payload.customer,
            amount: payload.amount,
            status: payload.status,
            issued: payload.issueDate,
            due: payload.dueDate,
            paid: 0,
          },
          {
            headers: { "X-Tenant-Id": "demo_tenant", "X-Request-Id": crypto.randomUUID(), "Idempotency-Key": crypto.randomUUID() },
          },
        );
        showSideEffects(res.meta);
        toast.success("Invoice created");
      } else if (selectedInvoice) {
        const res = await api.patch<ApiEnvelope<Record<string, unknown>>>(`/v1/crm/invoices/${selectedInvoice.id}`, {
          number: payload.number,
          customer: payload.customer,
          amount: payload.amount,
          status: payload.status,
          issued: payload.issueDate,
          due: payload.dueDate,
        }, {
          headers: { "X-Tenant-Id": "demo_tenant", "X-Request-Id": crypto.randomUUID(), "Idempotency-Key": crypto.randomUUID() },
        });
        showSideEffects(res.meta);
        toast.success("Invoice updated");
      }
      await loadInvoices();
      await loadReconciliation();
    } catch {
      if (sheetMode === "create") {
        setInvoiceList((prev) => [payload, ...prev]);
      } else {
        setInvoiceList((prev) => prev.map((invoice) => (invoice.id === payload.id ? payload : invoice)));
      }
      toast.message("Saved locally (API unavailable)");
    }
    setSheetOpen(false);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Invoices"
        description="Send, track and reconcile invoices."
        breadcrumbs={[{ label: "Operations" }, { label: "Invoices" }]}
        actions={
          <Button
            className="gradient-primary text-primary-foreground border-0"
            onClick={() => {
              openCreateSheet();
              toast.success("Create invoice form opened");
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        }
      />

      <Card className="p-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by invoice or customer..."
            className="pl-9"
          />
        </div>
      </Card>

      {reconciliation && (
        <Card className="p-3">
          <p className="text-sm font-medium">
            Reconciliation status: {reconciliation.balanced ? "Balanced" : "Mismatch detected"}
          </p>
          {reconciliation.issues.length > 0 && (
            <p className="mt-1 text-xs text-destructive">{reconciliation.issues.join(" | ")}</p>
          )}
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="space-y-3 p-3 md:hidden">
            {filteredInvoices.map((invoice) => (
              <div key={invoice.id} className="rounded-lg border p-3">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{invoice.number}</p>
                    <p className="text-xs text-muted-foreground">{invoice.issueDate}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditSheet(invoice)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Customer:</span> {invoice.customer}
                  </p>
                  <p className="capitalize">
                    <span className="text-muted-foreground">Payment:</span> {invoice.paymentMethod}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <Badge variant="outline" className={statusTone[invoice.status]}>
                      {invoice.status}
                    </Badge>
                    <span className="font-semibold">৳{invoice.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-lg border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-10">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.number}</TableCell>
                    <TableCell>{invoice.customer}</TableCell>
                    <TableCell>{invoice.issueDate}</TableCell>
                    <TableCell>{invoice.dueDate}</TableCell>
                    <TableCell className="capitalize">{invoice.paymentMethod}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusTone[invoice.status]}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">৳{invoice.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditSheet(invoice)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
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
        <SheetContent className="w-full overflow-y-auto sm:max-w-3xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {sheetMode === "create" ? "Create Invoice" : "Edit Invoice"}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Invoice Number</Label>
                <Input value={form.number} onChange={(e) => setForm((prev) => ({ ...prev, number: e.target.value }))} placeholder="e.g. INV-2026-2010" />
              </div>
              <div className="grid gap-2">
                <Label>Customer</Label>
                <Input value={form.customer} onChange={(e) => setForm((prev) => ({ ...prev, customer: e.target.value }))} placeholder="Customer name" />
              </div>
              <div className="grid gap-2">
                <Label>Issue Date</Label>
                <Input type="date" value={form.issueDate} onChange={(e) => setForm((prev) => ({ ...prev, issueDate: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Due Date</Label>
                <Input type="date" value={form.dueDate} onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Payment Method</Label>
                <Select value={form.paymentMethod} onValueChange={(value: InvoiceItem["paymentMethod"]) => setForm((prev) => ({ ...prev, paymentMethod: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="mobile">Mobile Banking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(value: InvoiceStatus) => setForm((prev) => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label>Total Amount</Label>
                <Input type="number" min={0} value={form.amount} onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))} placeholder="0.00" />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label>Notes</Label>
                <Textarea rows={4} value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Additional invoice notes..." />
              </div>
            </div>
          </div>

          <SheetFooter className="mt-6 flex-col-reverse gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>
              Cancel
            </Button>
            <Button className="gradient-primary text-primary-foreground border-0" onClick={saveInvoice}>
              <Send className="mr-2 h-4 w-4" />
              {sheetMode === "create" ? "Create Invoice" : "Update Invoice"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
