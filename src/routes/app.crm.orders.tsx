import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { erpApi } from "@/lib/erp-api";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { salesOrders } from "@/lib/crm-mock";
import { toast } from "sonner";

const variant: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  processing: "bg-info/10 text-info",
  shipped: "bg-violet-500/10 text-violet-500",
  completed: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

type OrderItem = {
  id: string;
  number: string;
  customer: string;
  date: string;
  delivery: string;
  status: "pending" | "processing" | "shipped" | "completed" | "cancelled";
  amount: number;
};

type OrderForm = {
  number: string;
  customer: string;
  date: string;
  delivery: string;
  status: OrderItem["status"];
  amount: string;
};

const emptyOrderForm: OrderForm = {
  number: "",
  customer: "",
  date: "",
  delivery: "",
  status: "pending",
  amount: "0",
};

export const Route = createFileRoute("/app/crm/orders")({ component: OrdersPage });

function OrdersPage() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [orderList, setOrderList] = useState<OrderItem[]>([]);
  const [form, setForm] = useState<OrderForm>(emptyOrderForm);

  useEffect(() => {
    void erpApi.crm
      .orders()
      .then((rows) => {
        setOrderList(
          (rows as Record<string, unknown>[]).map((r) => ({
            id: String(r.id ?? ""),
            number: String(r.number ?? ""),
            customer: String(r.customer_id ?? "Customer"),
            date: String(r.created_at ?? ""),
            delivery: String(r.created_at ?? ""),
            status: (String(r.status ?? "pending") as OrderItem["status"]) || "pending",
            amount: Number(r.amount ?? 0),
          }))
        );
      })
      .catch(() => toast.error("Failed to load CRM orders"));
  }, []);

  const filteredOrders = orderList.filter((o) => {
    const text = `${o.number} ${o.customer}`.toLowerCase();
    return text.includes(q.toLowerCase());
  });

  const createOrder = () => {
    const nextOrder: OrderItem = {
      id: `${Date.now()}`,
      number: form.number.trim() || `SO-${String(Date.now()).slice(-6)}`,
      customer: form.customer.trim() || "Walk-in Customer",
      date: form.date || new Date().toISOString().slice(0, 10),
      delivery: form.delivery || new Date().toISOString().slice(0, 10),
      status: form.status,
      amount: Number(form.amount) || 0,
    };

    setOrderList((prev) => [nextOrder, ...prev]);
    setOpen(false);
    setForm(emptyOrderForm);
    toast.success("New order created");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Orders"
        description="Manage confirmed orders from quote to delivery."
        breadcrumbs={[{ label: "CRM & Sales" }, { label: "Sales Orders" }]}
        actions={
          <Button
            className="gradient-primary text-primary-foreground border-0"
            onClick={() => {
              setForm(emptyOrderForm);
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        }
      />
      <Tabs defaultValue="all">
        <TabsList><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="pending">Pending</TabsTrigger><TabsTrigger value="shipped">Shipped</TabsTrigger><TabsTrigger value="completed">Completed</TabsTrigger></TabsList>
      </Tabs>
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search orders..." className="pl-9" />
          </div>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Order #</TableHead><TableHead>Customer</TableHead><TableHead className="hidden md:table-cell">Order Date</TableHead><TableHead className="hidden md:table-cell">Delivery</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="w-10" /></TableRow></TableHeader>
              <TableBody>
                {filteredOrders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.number}</TableCell>
                    <TableCell>{o.customer}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{o.date}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{o.delivery}</TableCell>
                    <TableCell><Badge className={variant[o.status]}>{o.status}</Badge></TableCell>
                    <TableCell className="text-right font-semibold">${o.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end"><DropdownMenuItem>View</DropdownMenuItem><DropdownMenuItem>Mark as shipped</DropdownMenuItem><DropdownMenuItem>Generate invoice</DropdownMenuItem><DropdownMenuItem className="text-destructive">Cancel</DropdownMenuItem></DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Create New Order</SheetTitle>
          </SheetHeader>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Order Number</Label>
              <Input placeholder="e.g. SO-2026-1001" value={form.number} onChange={(e) => setForm((prev) => ({ ...prev, number: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Customer</Label>
              <Input placeholder="Customer name" value={form.customer} onChange={(e) => setForm((prev) => ({ ...prev, customer: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Order Date</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Delivery Date</Label>
              <Input type="date" value={form.delivery} onChange={(e) => setForm((prev) => ({ ...prev, delivery: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(value: OrderItem["status"]) => setForm((prev) => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Amount</Label>
              <Input type="number" min={0} value={form.amount} onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))} />
            </div>
          </div>
          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="gradient-primary text-primary-foreground border-0" onClick={createOrder}>Create Order</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
