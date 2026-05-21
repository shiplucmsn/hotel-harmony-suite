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
import { usePurchaseGrn, useVoidGrn } from "@/hooks/purchase/use-purchase";
import { formatMoney, purchaseStatusTone } from "@/modules/purchase/utils";

export function GrnDetailPage() {
  const { grnId } = useParams({ strict: false }) as { grnId: string };
  const { data: grn, isLoading } = usePurchaseGrn(grnId);
  const voidGrn = useVoidGrn();

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
          grn?.status === "posted" && (
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
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-xs uppercase text-muted-foreground">Amount</p>
                <p className="mt-2 text-2xl font-semibold tabular-nums">
                  {formatMoney(grn.total_amount)}
                </p>
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

          <Card>
            <CardHeader>
              <CardTitle>Lines</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
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
