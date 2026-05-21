import { useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
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
import { ReceivePoDialog } from "@/modules/purchase/components/receive-po-dialog";
import {
  useApprovePurchaseOrder,
  useCancelPurchaseOrder,
  usePurchaseOrder,
} from "@/hooks/purchase/use-purchase";
import { formatMoney, purchaseStatusTone } from "@/modules/purchase/utils";
import type { PurchaseOrderLineDto } from "@/modules/purchase/types";

function remaining(line: PurchaseOrderLineDto): number {
  return Math.max(0, (line.quantity_ordered ?? 0) - (line.quantity_received ?? 0));
}

export function PurchaseOrderDetailPage() {
  const { orderId } = useParams({ strict: false }) as { orderId: string };
  const { data: order, isLoading } = usePurchaseOrder(orderId);
  const approve = useApprovePurchaseOrder();
  const cancel = useCancelPurchaseOrder();
  const [receiveOpen, setReceiveOpen] = useState(false);

  const canReceive =
    order && ["pending", "partial"].includes(order.status) && (order.lines ?? []).some((l) => remaining(l) > 0);

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
          order && (
            <div className="flex flex-wrap gap-2">
              {order.status === "pending_approval" && (
                <Button
                  size="sm"
                  disabled={approve.isPending}
                  onClick={() => void approve.mutateAsync(order.id)}
                >
                  {approve.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Approve
                </Button>
              )}
              {canReceive && (
                <Button size="sm" onClick={() => setReceiveOpen(true)}>
                  Receive goods
                </Button>
              )}
              {!["received", "cancelled"].includes(order.status) && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={cancel.isPending}
                  onClick={() => void cancel.mutateAsync(order.id)}
                >
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
                  {order.status}
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
        </>
      )}
    </div>
  );
}
