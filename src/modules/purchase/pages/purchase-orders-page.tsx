import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationBar } from "@/modules/finance/components/pagination-bar";
import { PurchaseOrderFormSheet } from "@/modules/purchase/components/purchase-order-form-sheet";
import { PurchaseOrderRowActions } from "@/modules/purchase/components/purchase-order-row-actions";
import {
  usePurchaseApSummary,
  usePurchaseOpenSummary,
  usePurchaseOrders,
} from "@/hooks/purchase/use-purchase";
import { poStatusLabel } from "@/modules/purchase/po-workflow";
import { formatMoney, purchaseStatusTone } from "@/modules/purchase/utils";
import type { PurchaseOrderDto } from "@/modules/purchase/types";

type PurchaseOrdersPageProps = {
  initialSupplierId?: number;
  openNewPo?: boolean;
};

export function PurchaseOrdersPage({ initialSupplierId, openNewPo }: PurchaseOrdersPageProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editOrderId, setEditOrderId] = useState<number | string | null>(null);
  const [statusTab, setStatusTab] = useState<string>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (openNewPo) {
      setFormMode("create");
      setEditOrderId(null);
      setFormOpen(true);
    }
  }, [openNewPo]);

  const listParams = useMemo(
    () => ({
      page,
      per_page: 20,
      status: statusTab === "all" ? undefined : statusTab,
      supplier_id: initialSupplierId,
    }),
    [page, statusTab, initialSupplierId],
  );

  const { data, isLoading, isFetching } = usePurchaseOrders(listParams);
  const { data: openSummary } = usePurchaseOpenSummary();
  const { data: apSummary } = usePurchaseApSummary();
  const orders = data?.data ?? [];
  const pagination = data?.pagination;

  const pageSpend = useMemo(
    () => orders.reduce((s, o) => s + o.total_amount, 0),
    [orders],
  );

  const openCreate = () => {
    setFormMode("create");
    setEditOrderId(null);
    setFormOpen(true);
  };

  const openEdit = (order: PurchaseOrderDto) => {
    setFormMode("edit");
    setEditOrderId(order.id);
    setFormOpen(true);
  };

  const handleSaved = (order: PurchaseOrderDto) => {
    setPage(1);
    if (order.status && ["draft", "pending", "pending_approval", "partial", "received", "cancelled"].includes(order.status)) {
      setStatusTab(order.status);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        description="Procurement requests to suppliers — create, approve, receive, and track AP impact."
        breadcrumbs={[{ label: "Purchases" }, { label: "Orders" }]}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link to="/app/inv/suppliers">Suppliers</Link>
            </Button>
            <Button
              size="sm"
              className="gradient-primary border-0 text-primary-foreground"
              onClick={openCreate}
            >
              <Plus className="mr-2 h-4 w-4" />
              New PO
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase text-muted-foreground">Open POs (tenant)</p>
            <p className="mt-2 text-2xl font-semibold">{openSummary?.open_order_count ?? "—"}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {openSummary?.awaiting_receive_count ?? 0} awaiting receive
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase text-muted-foreground">Pending receive value</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {openSummary ? formatMoney(openSummary.pending_receive_value) : "—"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {openSummary?.pending_receive_line_count ?? 0} lines open
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase text-muted-foreground">AP outstanding</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {apSummary ? formatMoney(apSummary.total_outstanding) : "—"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {apSummary?.supplier_count ?? 0} suppliers with balance
              {apSummary?.aging && (
                <> · 0–30d {formatMoney(apSummary.aging.current_0_30)}</>
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase text-muted-foreground">This page total</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{formatMoney(pageSpend)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{orders.length} orders shown</p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={statusTab}
        onValueChange={(v) => {
          setStatusTab(v);
          setPage(1);
        }}
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="pending_approval">Awaiting approval</TabsTrigger>
          <TabsTrigger value="partial">Partial</TabsTrigger>
          <TabsTrigger value="received">Received</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        <TabsContent value={statusTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Expected</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(isLoading || isFetching) && orders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                        Loading…
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading && orders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                        No purchase orders in this view.
                      </TableCell>
                    </TableRow>
                  )}
                  {orders.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell className="font-mono text-xs">
                        <Link
                          to="/app/inv/purchase-orders/$orderId"
                          params={{ orderId: String(po.id) }}
                          className="hover:underline"
                        >
                          {po.number}
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium">
                        {po.supplier_id ? (
                          <Link
                            to="/app/inv/supplier-ledger"
                            search={{ supplier_id: po.supplier_id }}
                            className="hover:underline"
                          >
                            {po.supplier}
                          </Link>
                        ) : (
                          po.supplier
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{po.order_date ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {po.expected_date ?? "—"}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {formatMoney(po.total_amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={purchaseStatusTone(po.status)}>
                          {poStatusLabel(po.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <PurchaseOrderRowActions order={po} onEdit={openEdit} />
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
        </TabsContent>
      </Tabs>

      <PurchaseOrderFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        orderId={editOrderId}
        defaultSupplierId={initialSupplierId}
        onSaved={handleSaved}
      />
    </div>
  );
}
