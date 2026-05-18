import { useState } from "react";
import { MoreHorizontal, PackageCheck, Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable, type DataTableColumn } from "@/shared/components/data-table/data-table";
import { PaginationBar } from "@/modules/finance/components/pagination-bar";
import { CrmFilters } from "@/modules/crm/components/crm-filters";
import { CrmStatusBadge } from "@/modules/crm/components/crm-status-badge";
import { OrderFormSheet } from "@/modules/crm/components/order-form-sheet";
import { useCrmOrders, useFulfillOrder } from "@/hooks/crm/use-crm";
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

  const { data, isLoading } = useCrmOrders({
    page,
    per_page: 15,
    search: search.trim() || undefined,
    status: status === "all" ? undefined : status,
  });
  const fulfillOrder = useFulfillOrder();

  const orders = data?.data ?? [];
  const pagination = data?.pagination ?? emptyPagination;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
  };

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
      id: "status",
      header: "Status",
      cell: (o) => <CrmStatusBadge kind="order" status={o.status} />,
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
      cell: (o) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {o.status !== "fulfilled" && o.status !== "cancelled" ? (
              <DropdownMenuItem
                disabled={fulfillOrder.isPending}
                onClick={() => fulfillOrder.mutate(o.id)}
              >
                <PackageCheck className="mr-2 h-4 w-4" />
                Fulfill (stock out)
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
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
    </div>
  );
}
