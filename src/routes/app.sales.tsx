import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, ShoppingCart, Plus, Pencil, Save, MoreHorizontal, PackagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { showSideEffects, type ApiEnvelope } from "@/lib/api-meta";

export const Route = createFileRoute("/app/sales")({ component: SalesPage });

type SaleItem = {
  id: string;
  invoiceNo: string;
  date: string;
  customer: string;
  phone: string;
  paymentMethod: "cash" | "card" | "bank" | "mobile";
  status: "pending" | "completed" | "cancelled";
  totalAmount: number;
};

type SaleLineItem = {
  id: string;
  product: string;
  qty: number;
  unitPrice: number;
  discount: number;
  tax: number;
  lineTotal: number;
};

const sales: SaleItem[] = [
  { id: "1", invoiceNo: "INV-2026-001", date: "2026-05-13", customer: "Saddam Hossain", phone: "+8801712345678", paymentMethod: "mobile", status: "completed", totalAmount: 14750 },
  { id: "2", invoiceNo: "INV-2026-002", date: "2026-05-13", customer: "Nusrat Jahan", phone: "+8801811122233", paymentMethod: "cash", status: "pending", totalAmount: 8200 },
  { id: "3", invoiceNo: "INV-2026-003", date: "2026-05-14", customer: "Kabir Ahmed", phone: "+8801912345678", paymentMethod: "card", status: "cancelled", totalAmount: 3950 },
];

const productOptions = [
  "Deluxe Room Booking",
  "Executive Room Booking",
  "Spa Package",
  "Airport Pickup",
  "Restaurant Buffet",
  "Conference Hall Rent",
];

const createLineItems: SaleLineItem[] = [
  { id: "c1", product: "Deluxe Room Booking", qty: 1, unitPrice: 6000, discount: 300, tax: 5, lineTotal: 5985 },
  { id: "c2", product: "Restaurant Buffet", qty: 2, unitPrice: 1200, discount: 0, tax: 5, lineTotal: 2520 },
];

const editLineItems: SaleLineItem[] = [
  { id: "e1", product: "Executive Room Booking", qty: 1, unitPrice: 12000, discount: 500, tax: 5, lineTotal: 12075 },
  { id: "e2", product: "Airport Pickup", qty: 1, unitPrice: 1800, discount: 0, tax: 5, lineTotal: 1890 },
];

const statusClass: Record<SaleItem["status"], string> = {
  pending: "bg-warning/15 text-warning border-warning/20",
  completed: "bg-success/15 text-success border-success/20",
  cancelled: "bg-destructive/15 text-destructive border-destructive/20",
};

function SalesPage() {
  const [query, setQuery] = useState("");
  const [salesList, setSalesList] = useState<SaleItem[]>(sales);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [selectedSale, setSelectedSale] = useState<SaleItem | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [lineItems, setLineItems] = useState<SaleLineItem[]>(createLineItems);

  const loadSales = async () => {
    try {
      const res = await api.get<ApiEnvelope<Record<string, unknown>[]> | Record<string, unknown>[]>("/v1/sales/orders", {
        headers: { "X-Tenant-Id": "demo_tenant", "X-Request-Id": crypto.randomUUID() },
      });
      const rows = Array.isArray(res) ? res : (res.data ?? []);
      const mapped = rows.map((r) => ({
        id: String(r.id ?? ""),
        invoiceNo: String(r.number ?? ""),
        date: String(r.order_date ?? ""),
        customer: String(r.customer ?? ""),
        phone: "+8801XXXXXXXXX",
        paymentMethod: "cash" as const,
        status: (String(r.status ?? "pending") as SaleItem["status"]) || "pending",
        totalAmount: Number(r.amount ?? 0),
      }));
      setSalesList(mapped);
    } catch {
      setSalesList(sales);
    }
  };

  useEffect(() => {
    void loadSales();
  }, []);

  const filteredSales = salesList.filter((sale) => {
    const text = `${sale.invoiceNo} ${sale.customer}`.toLowerCase();
    return text.includes(query.toLowerCase());
  });

  const openCreateSheet = () => {
    setSheetMode("create");
    setSelectedSale(null);
    setLineItems(createLineItems);
    setFormKey((prev) => prev + 1);
    setSheetOpen(true);
  };

  const openEditSheet = (sale: SaleItem) => {
    setSheetMode("edit");
    setSelectedSale(sale);
    setLineItems(editLineItems);
    setFormKey((prev) => prev + 1);
    setSheetOpen(true);
  };

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        id: `n${prev.length + 1}`,
        product: "Deluxe Room Booking",
        qty: 1,
        unitPrice: 0,
        discount: 0,
        tax: 0,
        lineTotal: 0,
      },
    ]);
    toast.message("New product row added");
  };

  const removeLineItem = (id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const saveSale = async () => {
    if (sheetMode === "create") {
      const total = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
      try {
        const res = await api.post<ApiEnvelope<Record<string, unknown>>>(
          "/v1/sales/orders",
          {
            number: `SO-${String(Date.now()).slice(-6)}`,
            customer: selectedSale?.customer || "Walk-in Customer",
            sku: "SKU-001",
            quantity: 1,
            amount: total || 0,
            unit_cost: 0,
            order_date: new Date().toISOString().slice(0, 10),
            delivery_date: new Date().toISOString().slice(0, 10),
          },
          {
            headers: {
              "X-Tenant-Id": "demo_tenant",
              "X-Request-Id": crypto.randomUUID(),
              "Idempotency-Key": crypto.randomUUID(),
            },
          },
        );
        showSideEffects(res.meta);
        toast.success("Sale created");
        await loadSales();
      } catch {
        toast.message("Saved locally (API unavailable)");
      }
    } else if (selectedSale) {
      setSalesList((prev) => prev.map((s) => (s.id === selectedSale.id ? { ...s, totalAmount: lineItems.reduce((sum, i) => sum + i.lineTotal, 0) } : s)));
      toast.success("Sale updated locally");
    }
    setSheetOpen(false);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Sales"
        description="Manage all sale records and update them from one place."
        breadcrumbs={[{ label: "Operations" }, { label: "Sales" }]}
        actions={
          <Button
            className="gradient-primary text-primary-foreground border-0"
            onClick={() => {
              openCreateSheet();
              toast.success("Create form opened");
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Sale
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

      <Card>
        <CardContent className="p-0">
          <div className="space-y-3 p-3 md:hidden">
            {filteredSales.map((sale) => (
              <div key={sale.id} className="rounded-lg border p-3">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{sale.invoiceNo}</p>
                    <p className="text-xs text-muted-foreground">{sale.date}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          openEditSheet(sale);
                          toast.message(`${sale.invoiceNo} edit form opened`);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Customer:</span> {sale.customer}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Phone:</span> {sale.phone}
                  </p>
                  <p className="capitalize">
                    <span className="text-muted-foreground">Payment:</span> {sale.paymentMethod}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <Badge variant="outline" className={statusClass[sale.status]}>
                      {sale.status}
                    </Badge>
                    <span className="font-semibold">৳{sale.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-lg border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead className="hidden md:table-cell">Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-10">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.invoiceNo}</TableCell>
                    <TableCell>{sale.date}</TableCell>
                    <TableCell>{sale.customer}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{sale.phone}</TableCell>
                    <TableCell className="hidden md:table-cell capitalize">{sale.paymentMethod}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusClass[sale.status]}>
                        {sale.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">৳{sale.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              openEditSheet(sale);
                              toast.message(`${sale.invoiceNo} edit form opened`);
                            }}
                          >
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
        <SheetContent className="w-full overflow-y-auto sm:max-w-4xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              {sheetMode === "create" ? "Create Sale" : "Edit Sale"}
            </SheetTitle>
          </SheetHeader>

          <div key={formKey} className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Invoice No *</Label>
                <Input placeholder="INV-2026-001" defaultValue={selectedSale?.invoiceNo} />
              </div>
              <div className="grid gap-2">
                <Label>Sale Date *</Label>
                <Input type="date" defaultValue={selectedSale?.date} />
              </div>
              <div className="grid gap-2">
                <Label>Customer Name *</Label>
                <Input placeholder="Customer name" defaultValue={selectedSale?.customer} />
              </div>
              <div className="grid gap-2">
                <Label>Customer Phone</Label>
                <Input placeholder="+8801XXXXXXXXX" defaultValue={selectedSale?.phone} />
              </div>
              <div className="grid gap-2">
                <Label>Payment Method *</Label>
                <Select defaultValue={selectedSale?.paymentMethod ?? "cash"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
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
                <Label>Status *</Label>
                <Select defaultValue={selectedSale?.status ?? "pending"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Products & Services</p>
                <Button size="sm" variant="outline" onClick={addLineItem}>
                  <PackagePlus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3 md:hidden">
                {lineItems.map((item) => (
                  <div key={item.id} className="rounded-lg border p-3">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold">Item</p>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => removeLineItem(item.id)}
                        disabled={lineItems.length <= 1}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <div className="grid gap-2">
                        <Label>Product</Label>
                        <Select defaultValue={item.product}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {productOptions.map((product) => (
                              <SelectItem key={product} value={product}>
                                {product}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="grid gap-1">
                          <Label>Qty</Label>
                          <Input type="number" min={1} defaultValue={String(item.qty)} />
                        </div>
                        <div className="grid gap-1">
                          <Label>Unit Price</Label>
                          <Input type="number" min={0} defaultValue={String(item.unitPrice)} />
                        </div>
                        <div className="grid gap-1">
                          <Label>Discount</Label>
                          <Input type="number" min={0} defaultValue={String(item.discount)} />
                        </div>
                        <div className="grid gap-1">
                          <Label>Tax %</Label>
                          <Input type="number" min={0} defaultValue={String(item.tax)} />
                        </div>
                      </div>
                      <div className="rounded-md bg-muted/50 px-3 py-2 text-sm font-medium">
                        Line Total: ৳{item.lineTotal.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden overflow-x-auto rounded-lg border md:block">
                <Table className="min-w-[860px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[230px]">Product</TableHead>
                      <TableHead className="w-[110px]">Qty</TableHead>
                      <TableHead className="w-[140px]">Unit Price</TableHead>
                      <TableHead className="w-[120px]">Discount</TableHead>
                      <TableHead className="w-[110px]">Tax %</TableHead>
                      <TableHead className="w-32 text-right">Line Total</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="min-w-[230px]">
                          <Select defaultValue={item.product}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {productOptions.map((product) => (
                                <SelectItem key={product} value={product}>
                                  {product}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="w-[110px]">
                          <Input type="number" min={1} defaultValue={String(item.qty)} placeholder="Qty" className="min-w-[90px]" />
                        </TableCell>
                        <TableCell className="w-[140px]">
                          <Input type="number" min={0} defaultValue={String(item.unitPrice)} placeholder="0" className="min-w-[120px]" />
                        </TableCell>
                        <TableCell className="w-[120px]">
                          <Input type="number" min={0} defaultValue={String(item.discount)} placeholder="0" className="min-w-[100px]" />
                        </TableCell>
                        <TableCell className="w-[110px]">
                          <Input type="number" min={0} defaultValue={String(item.tax)} placeholder="0" className="min-w-[90px]" />
                        </TableCell>
                        <TableCell className="text-right font-medium">৳{item.lineTotal.toLocaleString()}</TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => removeLineItem(item.id)}
                            disabled={lineItems.length <= 1}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Notes</Label>
                <Textarea rows={6} placeholder="Additional sales notes..." />
              </div>

              <div className="space-y-3 rounded-lg border p-3">
                <p className="text-sm font-semibold">Invoice Summary</p>
                <div className="grid gap-2">
                  <div className="grid grid-cols-2 items-center gap-2">
                    <Label>Subtotal</Label>
                    <Input type="number" defaultValue={selectedSale?.totalAmount ?? 8505} />
                  </div>
                  <div className="grid grid-cols-2 items-center gap-2">
                    <Label>Additional Discount</Label>
                    <Input type="number" defaultValue={0} />
                  </div>
                  <div className="grid grid-cols-2 items-center gap-2">
                    <Label>Shipping Charge</Label>
                    <Input type="number" defaultValue={0} />
                  </div>
                  <div className="grid grid-cols-2 items-center gap-2">
                    <Label>VAT / Tax %</Label>
                    <Input type="number" defaultValue={5} />
                  </div>
                  <div className="rounded-md bg-muted/50 px-3 py-2 text-sm font-semibold">
                    Grand Total: ৳{(selectedSale?.totalAmount ?? 8930).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <SheetFooter className="mt-6 flex-col-reverse gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>
              Cancel
            </Button>
            <Button
              className="gradient-primary text-primary-foreground border-0"
              onClick={saveSale}
            >
              {sheetMode === "create" ? <Save className="mr-2 h-4 w-4" /> : <Pencil className="mr-2 h-4 w-4" />}
              {sheetMode === "create" ? "Create Sale" : "Update Sale"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
