import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useApproveSupplierInvoice,
  useCreateVendorPayment,
  useMatchSupplierInvoice,
  useSupplierInvoice,
} from "@/hooks/purchase/use-purchase";
import { formatMoney, purchaseStatusTone } from "@/modules/purchase/utils";

type VendorInvoiceDetailPageProps = {
  invoiceId: string;
};

export function VendorInvoiceDetailPage({ invoiceId }: VendorInvoiceDetailPageProps) {
  const navigate = useNavigate();
  const { data: invoice, isLoading } = useSupplierInvoice(invoiceId);
  const match = useMatchSupplierInvoice();
  const approve = useApproveSupplierInvoice();
  const createPayment = useCreateVendorPayment();
  const [payOpen, setPayOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");

  const submitPay = async () => {
    if (!invoice) return;
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) return;
    await createPayment.mutateAsync({
      supplier_id: invoice.supplier_id,
      supplier_invoice_id: invoice.id,
      amount: amt,
      payment_date: new Date().toISOString().slice(0, 10),
    });
    setPayOpen(false);
    navigate({ to: "/app/inv/vendor-invoices" });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={invoice?.number ?? "Supplier invoice"}
        description={invoice?.vendor_invoice_number ?? ""}
        breadcrumbs={[
          { label: "Purchases" },
          { label: "Supplier invoices", href: "/app/inv/vendor-invoices" },
          { label: invoice?.number ?? invoiceId },
        ]}
        actions={
          invoice && (
            <div className="flex flex-wrap gap-2">
              {invoice.status === "draft" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={match.isPending}
                    onClick={() => void match.mutateAsync({ id: invoice.id })}
                  >
                    {match.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Run 3-way match
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={match.isPending}
                    onClick={() => void match.mutateAsync({ id: invoice.id, force: true })}
                  >
                    Force match
                  </Button>
                </>
              )}
              {invoice.status === "matched" && (
                <Button
                  size="sm"
                  disabled={approve.isPending}
                  onClick={() => void approve.mutateAsync(invoice.id)}
                >
                  {approve.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Approve
                </Button>
              )}
              {(invoice.status === "approved" || invoice.balance_due > 0) &&
                invoice.status !== "paid" && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setPayAmount(String(invoice.balance_due));
                      setPayOpen(true);
                    }}
                  >
                    Record payment
                  </Button>
                )}
            </div>
          )
        }
      />

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}

      {invoice && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-5">
                <p className="text-xs uppercase text-muted-foreground">Status</p>
                <Badge variant="outline" className={`mt-2 ${purchaseStatusTone(invoice.status)}`}>
                  {invoice.status}
                </Badge>
                {invoice.match_status && (
                  <p className="mt-1 text-xs text-muted-foreground">Match: {invoice.match_status}</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-xs uppercase text-muted-foreground">Total</p>
                <p className="mt-2 text-2xl font-semibold tabular-nums">
                  {formatMoney(invoice.total_amount)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-xs uppercase text-muted-foreground">Balance due</p>
                <p className="mt-2 text-2xl font-semibold tabular-nums">
                  {formatMoney(invoice.balance_due)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-xs uppercase text-muted-foreground">Supplier</p>
                <p className="mt-2 font-medium">{invoice.supplier?.name ?? invoice.supplier_id}</p>
                {(invoice.grn_ids ?? []).map((gid) => (
                  <Link
                    key={gid}
                    to="/app/inv/grn/$grnId"
                    params={{ grnId: String(gid) }}
                    className="block text-sm text-primary hover:underline"
                  >
                    GRN #{gid}
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>

          {invoice.match_result?.variances && invoice.match_result.variances.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Match variances</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <pre className="overflow-auto rounded-md bg-muted p-3 text-xs">
                  {JSON.stringify(invoice.match_result.variances, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Lines</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Invoice qty</TableHead>
                    <TableHead className="text-right">GRN qty</TableHead>
                    <TableHead className="text-right">PO qty</TableHead>
                    <TableHead className="text-right">Unit cost</TableHead>
                    <TableHead className="text-right">Line total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(invoice.lines ?? []).map((line) => (
                    <TableRow key={line.id ?? line.sku}>
                      <TableCell className="font-mono text-xs">{line.sku}</TableCell>
                      <TableCell className="text-right">{line.quantity}</TableCell>
                      <TableCell className="text-right">{line.grn_quantity ?? "—"}</TableCell>
                      <TableCell className="text-right">{line.po_quantity ?? "—"}</TableCell>
                      <TableCell className="text-right">{formatMoney(line.unit_cost)}</TableCell>
                      <TableCell className="text-right">{formatMoney(line.line_total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pay supplier invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayOpen(false)}>
              Cancel
            </Button>
            <Button disabled={createPayment.isPending} onClick={() => void submitPay()}>
              {createPayment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Post payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
