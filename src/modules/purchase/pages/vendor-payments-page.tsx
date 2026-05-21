import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationBar } from "@/modules/finance/components/pagination-bar";
import { SupplierSelect } from "@/modules/purchase/components/supplier-select";
import { useCreateVendorPayment, useSupplier, useVendorPayments } from "@/hooks/purchase/use-purchase";
import { formatMoney, purchaseStatusTone } from "@/modules/purchase/utils";

type VendorPaymentsPageProps = {
  initialSupplierId?: number;
};

export function VendorPaymentsPage({ initialSupplierId }: VendorPaymentsPageProps) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [supplierFilter, setSupplierFilter] = useState(
    initialSupplierId ? String(initialSupplierId) : "",
  );
  const [supplierId, setSupplierId] = useState(
    initialSupplierId ? String(initialSupplierId) : "",
  );
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState("bank_transfer");
  const [reference, setReference] = useState("");

  const { data, isLoading } = useVendorPayments({ page, per_page: 20 });
  const payments = data?.data ?? [];
  const pagination = data?.pagination;
  const createPayment = useCreateVendorPayment();
  const { data: supplierDetail } = useSupplier(supplierId || null);
  const supplierBalance = supplierDetail?.balance ?? 0;

  const monthTotal = useMemo(
    () => payments.reduce((s, p) => s + p.amount, 0),
    [payments],
  );

  const submit = async () => {
    const amt = parseFloat(amount);
    if (!supplierId || !amt || amt <= 0) return;
    await createPayment.mutateAsync({
      supplier_id: Number(supplierId),
      amount: amt,
      payment_date: paymentDate,
      method,
      reference: reference || undefined,
    });
    setOpen(false);
    setAmount("");
    setReference("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendor Payments"
        description="Record supplier payouts against accounts payable."
        breadcrumbs={[{ label: "Purchases" }, { label: "Payments" }]}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link to="/app/inv/suppliers">Suppliers</Link>
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gradient-primary border-0 text-primary-foreground">
                  <Plus className="mr-2 h-4 w-4" />
                  Record payment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record vendor payment</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Supplier *</Label>
                    <SupplierSelect value={supplierId} onValueChange={setSupplierId} />
                    {supplierId && (
                      <p className="text-xs text-muted-foreground">
                        Outstanding balance: {formatMoney(supplierBalance)}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Amount *</Label>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Method</Label>
                    <Select value={method} onValueChange={setMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank_transfer">Bank transfer</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Reference / notes</Label>
                    <Input value={reference} onChange={(e) => setReference(e.target.value)} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    disabled={
                      createPayment.isPending ||
                      !supplierId ||
                      (parseFloat(amount) > supplierBalance && supplierBalance > 0)
                    }
                    onClick={() => void submit()}
                  >
                    {createPayment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <Card>
        <CardContent className="flex flex-wrap items-end gap-4 p-4">
          <div className="min-w-[200px] flex-1 space-y-1.5">
            <Label>Filter by supplier</Label>
            <SupplierSelect
              value={supplierFilter}
              onValueChange={(v) => {
                setSupplierFilter(v);
                setPage(1);
              }}
              placeholder="All suppliers"
              activeOnly={false}
            />
          </div>
          {supplierFilter && (
            <Button variant="ghost" size="sm" onClick={() => setSupplierFilter("")}>
              Clear filter
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase text-muted-foreground">Payments on this page</p>
            <p className="mt-2 text-2xl font-semibold">{formatMoney(monthTotal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase text-muted-foreground">Count</p>
            <p className="mt-2 text-2xl font-semibold">{pagination?.total ?? payments.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No payments recorded yet.
                  </TableCell>
                </TableRow>
              )}
              {payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.number}</TableCell>
                  <TableCell className="font-medium">
                    <Link
                      to="/app/inv/supplier-ledger"
                      search={{ supplier_id: p.supplier_id }}
                      className="hover:underline"
                    >
                      {p.supplier?.name ?? `Supplier #${p.supplier_id}`}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.method ?? "—"}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {formatMoney(p.amount)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.payment_date ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={purchaseStatusTone(p.status)}>
                      {p.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {pagination && pagination.lastPage > 1 && (
            <PaginationBar pagination={pagination} onPageChange={setPage} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
