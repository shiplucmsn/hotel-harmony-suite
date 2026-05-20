import { useState } from "react";
import {
  FileText,
  Loader2,
  MoreHorizontal,
  PackageCheck,
  Plus,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable, type DataTableColumn } from "@/shared/components/data-table/data-table";
import { PaginationBar } from "@/modules/finance/components/pagination-bar";
import { CrmFilters } from "@/modules/crm/components/crm-filters";
import { CrmStatusBadge } from "@/modules/crm/components/crm-status-badge";
import { ConfirmOrderDialog } from "@/modules/crm/components/confirm-order-dialog";
import { FulfillOrderDialog } from "@/modules/crm/components/fulfill-order-dialog";
import { InvoiceFormSheet } from "@/modules/crm/components/invoice-form-sheet";
import { OrderFormSheet } from "@/modules/crm/components/order-form-sheet";
import { useCancelOrder, useConfirmOrder, useCrmOrders, useFulfillOrder } from "@/hooks/crm/use-crm";
import { formatMoney } from "@/modules/crm/utils";
import type { CrmOrderDto } from "@/modules/crm/types";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "fulfilled", label: "Fulfilled" },
  { value: "cancelled", label: "Cancelled" },
];

const emptyPagination = { page: 1, perPage: 15, total: 0, lastPage: 1 };

export function OrdersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoicePrefill, setInvoicePrefill] = useState<{
    customerId?: string;
    orderId?: string;
    autoFulfill?: boolean;
  }>({});
  const [confirmTarget, setConfirmTarget] = useState<CrmOrderDto | null>(null);
  const [fulfillTarget, setFulfillTarget] = useState<CrmOrderDto | null>(null);

  const { data, isLoading } = useCrmOrders({
    page,
    per_page: 15,
    search: search.trim() || undefined,
    status: status === "all" ? undefined : status,
  });
  const fulfillOrder = useFulfillOrder();
  const confirmOrder = useConfirmOrder();
  const cancelOrder = useCancelOrder();

  const orders = data?.data ?? [];
  const pagination = data?.pagination ?? emptyPagination;

  const openInvoiceForOrder = (o: CrmOrderDto) => {
    setInvoicePrefill({
      customerId: o.customer_id ? String(o.customer_id) : undefined,
      orderId: String(o.id),
      autoFulfill: o.status !== "fulfilled",
    });
    setInvoiceOpen(true);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  const handleFulfill = (o: CrmOrderDto) => {
    if (o.warehouse_id) {
      fulfillOrder.mutate({ id: o.id });
      return;
    }
    setFulfillTarget(o);
  };

  const isConfirming = (id: number) =>
    confirmOrder.isPending && confirmOrder.variables?.id === id;

  const isFulfilling = (id: number) =>
    fulfillOrder.isPending && fulfillOrder.variables?.id === id;

  const columns: DataTableColumn<CrmOrderDto>[] = [
    { id: "number", header: "Order #", cell: (o) => <span className="font-medium">{o.number}</span> },
    {
      id: "customer",
      header: "Customer",
      cell: (o) => o.customer ?? (o.customer_id ? `Customer #${o.customer_id}` : "—"),
    },
    {
      id: "date",
      header: "Date",
      className: "hidden md:table-cell",
      cell: (o) => o.order_date ?? "—",
    },
    {
      id: "warehouse",
      header: "Ship from",
      className: "hidden lg:table-cell",
      cell: (o) => (
        <span className="text-sm text-muted-foreground">
          {o.warehouse?.name ?? (o.warehouse_id ? `WH #${o.warehouse_id}` : "—")}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (o) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <CrmStatusBadge kind="order" status={o.status} />
          {o.needs_invoice ? (
            <Badge variant="outline" className="border-warning/40 text-warning">
              Needs invoice
            </Badge>
          ) : null}
        </div>
      ),
    },
    {
      id: "total",
      header: "Total",
      className: "text-right",
      cell: (o) => <span className="font-semibold tabular-nums">{formatMoney(o.total_amount)}</span>,
    },
    {
      id: "actions",
      header: "",
      className: "w-10",
      cell: (o) => {
        const fulfilling = isFulfilling(o.id);
        const confirming = isConfirming(o.id);
        const cancelling =
          cancelOrder.isPending && String(cancelOrder.variables) === String(o.id);

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {o.status === "pending" ? (
                <DropdownMenuItem disabled={confirming} onClick={() => setConfirmTarget(o)}>
                  {confirming ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="mr-2 h-4 w-4" />
                  )}
                  Confirm (reserve stock)
                </DropdownMenuItem>
              ) : null}
              {o.status !== "fulfilled" && o.status !== "cancelled" ? (
                <DropdownMenuItem disabled={fulfilling} onClick={() => handleFulfill(o)}>
                  {fulfilling ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <PackageCheck className="mr-2 h-4 w-4" />
                  )}
                  Fulfill (stock out)
                </DropdownMenuItem>
              ) : null}
              {o.status === "fulfilled" ? (
                <DropdownMenuItem onClick={() => openInvoiceForOrder(o)}>
                  <FileText className="mr-2 h-4 w-4" />
                  {o.needs_invoice ? "Create invoice" : "Issue invoice"}
                </DropdownMenuItem>
              ) : null}
              {o.status !== "cancelled" && o.status !== "fulfilled" ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    disabled={cancelling}
                    onClick={() => cancelOrder.mutate(o.id)}
                  >
                    {cancelling ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    Cancel order
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Sales Orders"
        description="Create orders from the database, fulfill inventory, then issue invoices."
        breadcrumbs={[{ label: "CRM & Sales" }, { label: "Sales Orders" }]}
        actions={
          <Button
            className="gradient-primary w-full border-0 text-primary-foreground sm:w-auto"
            onClick={() => setFormOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Button>
        }
      />

      <Card className="border-dashed bg-muted/30">
        <CardContent className="grid gap-2 p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <p>
            <span className="font-medium text-foreground">1. Create</span> — saves the order only (no
            stock or revenue).
          </p>
          <p>
            <span className="font-medium text-foreground">2. Confirm</span> — pick warehouse and reserve stock.
          </p>
          <p>
            <span className="font-medium text-foreground">3. Fulfill</span> — ships stock and posts COGS.
          </p>
          <p>
            <span className="font-medium text-foreground">4. Invoice</span> — records AR and revenue.
          </p>
        </CardContent>
      </Card>

      <CrmFilters
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search orders…"
        status={status}
        onStatusChange={handleStatusChange}
        statusOptions={STATUS_OPTIONS}
      />
      <Card className="p-4">
        <DataTable
          columns={columns}
          data={orders}
          loading={isLoading}
          emptyTitle="No orders"
          emptyDescription="Create a sales order with product lines."
          getRowId={(o) => String(o.id)}
        />
        {pagination.total > 0 ? (
          <PaginationBar pagination={pagination} onPageChange={setPage} className="mt-4" />
        ) : null}
      </Card>
      <OrderFormSheet open={formOpen} onOpenChange={setFormOpen} />
      <ConfirmOrderDialog
        order={confirmTarget}
        open={Boolean(confirmTarget)}
        onOpenChange={(open) => {
          if (!open) setConfirmTarget(null);
        }}
      />
      <FulfillOrderDialog
        order={fulfillTarget}
        open={Boolean(fulfillTarget)}
        onOpenChange={(open) => {
          if (!open) setFulfillTarget(null);
        }}
      />
      <InvoiceFormSheet
        open={invoiceOpen}
        onOpenChange={setInvoiceOpen}
        defaultCustomerId={invoicePrefill.customerId}
        defaultOrderId={invoicePrefill.orderId}
        autoFulfill={invoicePrefill.autoFulfill}
      />
    </div>
  );
}
