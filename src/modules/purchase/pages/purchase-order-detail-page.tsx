import { useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { Route as PurchaseOrderDetailRoute } from "@/routes/app.inv.purchase-orders.$orderId";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PurchaseOrderFormSheet } from "@/modules/purchase/components/purchase-order-form-sheet";
import { ReceivePoDialog } from "@/modules/purchase/components/receive-po-dialog";
import {
  useApprovePurchaseOrder,
  useCancelPurchaseOrder,
  usePurchaseGrns,
  usePurchaseOrder,
  usePurchaseOrderActivity,
  useSubmitPurchaseOrder,
} from "@/hooks/purchase/use-purchase";
import { getPoWorkflow, poStatusLabel } from "@/modules/purchase/po-workflow";
import { formatMoney, purchaseStatusTone } from "@/modules/purchase/utils";
import type { PurchaseOrderLineDto } from "@/modules/purchase/types";

function remaining(line: PurchaseOrderLineDto): number {
  return Math.max(0, (line.quantity_ordered ?? 0) - (line.quantity_received ?? 0));
}

export function PurchaseOrderDetailPage() {
  const { orderId } = PurchaseOrderDetailRoute.useParams();
  const { data: order, isLoading } = usePurchaseOrder(orderId);
  const { data: activity = [] } = usePurchaseOrderActivity(orderId);
  const { data: grnsData } = usePurchaseGrns({
    purchase_order_id: Number(orderId),
    per_page: 20,
  });
  const grns = grnsData?.data ?? [];
  const approve = useApprovePurchaseOrder();
  const cancel = useCancelPurchaseOrder();
  const submit = useSubmitPurchaseOrder();
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const workflow = order ? getPoWorkflow(order) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={order?.number ?? "Purchase order"}
        description={order ? `${order.supplier} · ${order.order_date ?? ""}` : "Loading…"}
        breadcrumbs={[
          { label: "Purchases" },
          { label: "Purchase orders", href: "/app/inv/purchase-orders" },
          { label: order?.number ?? orderId },
        ]}
        actions={
          order && workflow && (
            <div className="flex flex-wrap gap-2">
              {workflow.canEdit && (
                <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
                  Edit draft
                </Button>
              )}
              {workflow.canSubmit && (
                <Button
                  size="sm"
                  disabled={submit.isPending}
                  onClick={() => void submit.mutateAsync({ id: order.id })}
                >
                  {submit.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit PO
                </Button>
              )}
              {workflow.canApprove && (
                <Button
                  size="sm"
                  disabled={approve.isPending}
                  onClick={() => void approve.mutateAsync(order.id)}
                >
                  {approve.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Approve
                </Button>
              )}
              {workflow.canReceive && (
                <Button size="sm" onClick={() => setReceiveOpen(true)}>
                  Receive goods
                </Button>
              )}
              {workflow.canCancel && (
                <Button size="sm" variant="outline" onClick={() => setConfirmCancel(true)}>
                  Cancel PO
                </Button>
              )}
            </div>
          )
        }
      />

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}

      {order && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <p className="text-xs uppercase text-muted-foreground">Status</p>
                <Badge variant="outline" className={`mt-2 ${purchaseStatusTone(order.status)}`}>
                  {poStatusLabel(order.status)}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-xs uppercase text-muted-foreground">Total</p>
                <p className="mt-2 text-2xl font-semibold tabular-nums">
                  {formatMoney(order.total_amount)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-xs uppercase text-muted-foreground">Supplier</p>
                {order.supplier_id ? (
                  <Link
                    to="/app/inv/supplier-ledger"
                    search={{ supplier_id: order.supplier_id }}
                    className="mt-2 block font-medium hover:underline"
                  >
                    {order.supplier}
                  </Link>
                ) : (
                  <p className="mt-2 font-medium">{order.supplier}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {order.notes && (
            <Card>
              <CardContent className="p-5 text-sm text-muted-foreground">{order.notes}</CardContent>
            </Card>
          )}

          {grns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Goods receipts (GRN)</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>GRN</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grns.map((g) => (
                      <TableRow key={g.id}>
                        <TableCell className="font-mono text-xs">
                          <Link
                            to="/app/inv/grn/$grnId"
                            params={{ grnId: String(g.id) }}
                            className="hover:underline"
                          >
                            {g.number}
                          </Link>
                        </TableCell>
                        <TableCell>{g.received_date ?? "—"}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatMoney(g.total_amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={purchaseStatusTone(g.status)}>
                            {g.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {activity.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {activity.map((entry) => (
                  <div key={entry.id} className="flex justify-between gap-4 text-sm border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium">{entry.description}</p>
                      {entry.event_name && (
                        <p className="text-xs text-muted-foreground">{entry.event_name}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {entry.created_at ? new Date(entry.created_at).toLocaleString() : ""}
                    </span>
                  </div>
                ))}
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
                    <TableHead className="text-right">Ordered</TableHead>
                    <TableHead className="text-right">Received</TableHead>
                    <TableHead className="text-right">Remaining</TableHead>
                    <TableHead className="text-right">Unit cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(order.lines ?? []).map((line) => (
                    <TableRow key={line.sku}>
                      <TableCell className="font-mono text-xs">{line.sku}</TableCell>
                      <TableCell className="text-right">{line.quantity_ordered}</TableCell>
                      <TableCell className="text-right">{line.quantity_received}</TableCell>
                      <TableCell className="text-right font-medium">{remaining(line)}</TableCell>
                      <TableCell className="text-right">{formatMoney(line.unit_cost)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <ReceivePoDialog orderId={order.id} open={receiveOpen} onOpenChange={setReceiveOpen} />
          <PurchaseOrderFormSheet
            open={editOpen}
            onOpenChange={setEditOpen}
            mode="edit"
            orderId={order.id}
          />
          <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel purchase order?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cancel {order.number}. Open receipts may block cancellation.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Back</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    void cancel.mutateAsync(order.id);
                    setConfirmCancel(false);
                  }}
                >
                  Cancel PO
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
