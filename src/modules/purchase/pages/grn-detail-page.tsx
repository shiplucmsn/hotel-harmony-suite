import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePermissions } from "@/hooks/rbac/use-permissions";
import {
  useCreateSupplierInvoice,
  usePurchaseGrn,
  useQcAcceptGrn,
  useQcRejectGrn,
  useVoidGrn,
} from "@/hooks/purchase/use-purchase";
import { formatMoney, purchaseStatusTone } from "@/modules/purchase/utils";

export function GrnDetailPage() {
  const { grnId } = useParams({ strict: false }) as { grnId: string };
  const navigate = useNavigate();
  const { data: grn, isLoading } = usePurchaseGrn(grnId);
  const { can } = usePermissions();
  const canManageQc = can("purchase.grn.qc.manage");
  const voidGrn = useVoidGrn();
  const qcAccept = useQcAcceptGrn();
  const qcReject = useQcRejectGrn();
  const createInvoice = useCreateSupplierInvoice();

  return (
    <div className="space-y-6">
      <PageHeader
        title={grn?.number ?? "GRN"}
        description={grn?.received_date ?? ""}
        breadcrumbs={[
          { label: "Purchases" },
          { label: "GRN", href: "/app/inv/grn" },
          { label: grn?.number ?? grnId },
        ]}
        actions={
          grn && (
            <div className="flex flex-wrap gap-2">
              {grn.qc_status === "pending" && canManageQc && (
                <>
                  <Button
                    size="sm"
                    disabled={qcAccept.isPending}
                    onClick={() => void qcAccept.mutateAsync(grn.id)}
                  >
                    {qcAccept.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Accept QC
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={qcReject.isPending}
                    onClick={() => {
                      if (confirm("Reject QC? Stock will leave quarantine.")) {
                        void qcReject.mutateAsync({ id: grn.id });
                      }
                    }}
                  >
                    {qcReject.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Reject QC
                  </Button>
                </>
              )}
              {grn.status === "posted" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={createInvoice.isPending}
                    onClick={async () => {
                      const res = await createInvoice.mutateAsync({
                        purchase_grn_id: grn.id,
                        supplier_id: grn.supplier_id ?? undefined,
                      });
                      const inv = res.data;
                      if (inv?.id) {
                        navigate({
                          to: "/app/inv/vendor-invoices/$invoiceId",
                          params: { invoiceId: String(inv.id) },
                        });
                      }
                    }}
                  >
                    {createInvoice.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create supplier invoice
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={voidGrn.isPending}
                    onClick={() => {
                      if (confirm("Void this GRN? Stock and AP will be reversed.")) {
                        void voidGrn.mutateAsync(grn.id);
                      }
                    }}
                  >
                    {voidGrn.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Void GRN
                  </Button>
                </>
              )}
            </div>
          )
        }
      />

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}

      {grn && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <p className="text-xs uppercase text-muted-foreground">Status</p>
                <Badge variant="outline" className={`mt-2 ${purchaseStatusTone(grn.status)}`}>
                  {grn.status}
                </Badge>
                {grn.qc_status && grn.qc_status !== "none" && (
                  <p className="mt-1 text-xs text-muted-foreground">QC: {grn.qc_status}</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-xs uppercase text-muted-foreground">Total (base AP)</p>
                <p className="mt-2 text-2xl font-semibold tabular-nums">
                  {formatMoney(grn.total_amount)}
                </p>
                {(grn.subtotal != null || grn.tax_amount != null) && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Inventory {formatMoney(grn.subtotal ?? grn.total_amount)}
                    {(grn.tax_amount ?? 0) > 0 && <> · Tax {formatMoney(grn.tax_amount ?? 0)}</>}
                  </p>
                )}
                {grn.currency_code && grn.currency_code !== "USD" && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {grn.currency_code} @ {grn.exchange_rate}
                    {grn.foreign_total_amount != null &&
                      ` · Foreign ${formatMoney(grn.foreign_total_amount)}`}
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-xs uppercase text-muted-foreground">Supplier</p>
                <p className="mt-2 font-medium">{grn.supplier?.name ?? grn.supplier_id}</p>
                {grn.purchase_order_id && (
                  <Link
                    to="/app/inv/purchase-orders/$orderId"
                    params={{ orderId: String(grn.purchase_order_id) }}
                    className="text-sm text-primary hover:underline"
                  >
                    PO #{grn.purchase_order_id}
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>

          {(grn.landed_costs?.length ?? 0) > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Landed costs</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grn.landed_costs!.map((lc) => (
                      <TableRow key={lc.id ?? `${lc.cost_type}-${lc.amount}`}>
                        <TableCell>{lc.cost_type}</TableCell>
                        <TableCell>{lc.allocation_method}</TableCell>
                        <TableCell className="text-right">{formatMoney(lc.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                    <TableHead>Lot / batch</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit cost</TableHead>
                    <TableHead className="text-right">Line total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(grn.lines ?? []).length > 0 ? (
                    grn.lines!.map((line) => (
                      <TableRow key={line.sku}>
                        <TableCell className="font-mono text-xs">{line.sku}</TableCell>
                        <TableCell className="font-mono text-xs">{line.batch_number ?? "—"}</TableCell>
                        <TableCell>{line.expiry_date ?? "—"}</TableCell>
                        <TableCell className="text-right">{line.quantity}</TableCell>
                        <TableCell className="text-right">{formatMoney(line.unit_cost)}</TableCell>
                        <TableCell className="text-right">
                          {formatMoney(line.line_total ?? line.quantity * line.unit_cost)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className="font-mono text-xs">{grn.sku}</TableCell>
                      <TableCell>—</TableCell>
                      <TableCell>—</TableCell>
                      <TableCell className="text-right">{grn.quantity}</TableCell>
                      <TableCell className="text-right">{formatMoney(grn.unit_cost ?? 0)}</TableCell>
                      <TableCell className="text-right">{formatMoney(grn.total_amount)}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
