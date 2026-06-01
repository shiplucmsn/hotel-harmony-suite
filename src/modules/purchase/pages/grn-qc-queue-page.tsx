import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Loader2, X } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationBar } from "@/modules/finance/components/pagination-bar";
import { usePermissions } from "@/hooks/rbac/use-permissions";
import { useGrnQcQueue, useQcAcceptGrn, useQcRejectGrn } from "@/hooks/purchase/use-purchase";
import { formatMoney, purchaseStatusTone } from "@/modules/purchase/utils";

export function GrnQcQueuePage() {
  const [page, setPage] = useState(1);
  const [createReturnOnReject, setCreateReturnOnReject] = useState(false);
  const { can } = usePermissions();
  const canManageQc = can("purchase.grn.qc.manage");
  const { data, isLoading } = useGrnQcQueue({ page, per_page: 20 });
  const grns = data?.data ?? [];
  const pagination = data?.pagination;
  const accept = useQcAcceptGrn();
  const reject = useQcRejectGrn();

  return (
    <div className="space-y-6">
      <PageHeader
        title="GRN QC queue"
        description={
          canManageQc
            ? "Goods in quarantine awaiting inspection. Accept moves stock to sellable warehouse."
            : "View-only: you need Accept/Reject GRN QC permission to process items."
        }
        breadcrumbs={[{ label: "Purchases" }, { label: "QC queue" }]}
        actions={
          <div className="flex items-center gap-2">
            <Checkbox
              id="create-return-reject"
              checked={createReturnOnReject}
              onCheckedChange={(v) => setCreateReturnOnReject(v === true)}
            />
            <Label htmlFor="create-return-reject" className="text-sm font-normal">
              Post purchase return on reject
            </Label>
          </div>
        }
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>GRN</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Received</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && grns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No GRNs pending QC.
                  </TableCell>
                </TableRow>
              )}
              {grns.map((g) => (
                <TableRow key={g.id}>
                  <TableCell>
                    <Link
                      to="/app/inv/grn/$grnId"
                      params={{ grnId: String(g.id) }}
                      className="font-medium text-primary hover:underline"
                    >
                      {g.number}
                    </Link>
                    <Badge variant="outline" className={`ml-2 ${purchaseStatusTone(g.qc_status ?? "")}`}>
                      {g.qc_status}
                    </Badge>
                  </TableCell>
                  <TableCell>{g.supplier?.name ?? g.supplier_id}</TableCell>
                  <TableCell>{g.received_date ?? "—"}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(g.total_amount)}</TableCell>
                  <TableCell className="text-right">
                    {canManageQc ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={accept.isPending || reject.isPending}
                          onClick={() => void accept.mutateAsync(g.id)}
                        >
                          {accept.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          <span className="sr-only">Accept</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={accept.isPending || reject.isPending}
                          onClick={() =>
                            void reject.mutateAsync({
                              id: g.id,
                              body: { create_return: createReturnOnReject },
                            })
                          }
                        >
                          {reject.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                          <span className="sr-only">Reject</span>
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">No QC manage access</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {pagination && (
            <PaginationBar pagination={pagination} onPageChange={setPage} className="border-t px-4 py-3" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
