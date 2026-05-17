import { useMemo, useState } from "react";
import { Plus, PackageCheck } from "lucide-react";
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
import { paginateClient } from "@/modules/finance/utils";
import { CrmFilters } from "@/modules/crm/components/crm-filters";
import { CrmStatusBadge } from "@/modules/crm/components/crm-status-badge";
import { OrderFormSheet } from "@/modules/crm/components/order-form-sheet";
import { useCrmCustomers, useCrmOrders, useFulfillOrder } from "@/hooks/crm/use-crm";
import { customerLabel, formatMoney } from "@/modules/crm/utils";
import type { CrmOrderDto } from "@/modules/crm/types";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "fulfilled", label: "Fulfilled" },
  { value: "cancelled", label: "Cancelled" },
];

export function OrdersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const perPage = 15;

  const { data, isLoading } = useCrmOrders({
    per_page: 200,
    status: status === "all" ? undefined : status,
  });
  const { data: customersData } = useCrmCustomers({ per_page: 200 });
  const fulfillOrder = useFulfillOrder();

  const customerMap = useMemo(() => {
    const m = new Map<number, string>();
    for (const c of customersData?.data ?? []) m.set(c.id, c.name);
    return m;
  }, [customersData]);

  const orders = data?.data ?? [];
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orders.filter((o) => {
      const label = customerLabel(o.customer_id, customerMap).toLowerCase();
      return !q || o.number.toLowerCase().includes(q) || label.includes(q);
    });
  }, [orders, search, customerMap]);

  const { data: rows, pagination } = useMemo(
    () => paginateClient(filtered, page, perPage),
    [filtered, page, perPage],
  );

  const columns: DataTableColumn<CrmOrderDto>[] = [
    { id: "number", header: "Order #", cell: (o) => <span className="font-medium">{o.number}</span> },
    {
      id: "customer",
      header: "Customer",
      cell: (o) => customerLabel(o.customer_id, customerMap),
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
      className: "w-24",
      cell: (o) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              ···
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {o.status !== "fulfilled" && o.status !== "cancelled" && (
              <DropdownMenuItem
                disabled={fulfillOrder.isPending}
                onClick={() => fulfillOrder.mutate(o.id)}
              >
                <PackageCheck className="mr-2 h-4 w-4" />
                Fulfill (stock out)
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Orders"
        description="Create orders, fulfill inventory, then issue invoices."
        breadcrumbs={[{ label: "CRM & Sales" }, { label: "Sales Orders" }]}
        actions={
          <Button className="gradient-primary border-0 text-primary-foreground" onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Button>
        }
      />
      <CrmFilters
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search orders…"
        status={status}
        onStatusChange={(v) => {
          setStatus(v);
          setPage(1);
        }}
        statusOptions={STATUS_OPTIONS}
      />
      <Card className="p-4">
        <DataTable
          columns={columns}
          data={rows}
          loading={isLoading}
          emptyTitle="No orders"
          emptyDescription="Create a sales order with product lines."
          getRowId={(o) => String(o.id)}
        />
        <PaginationBar
          page={pagination.page}
          lastPage={pagination.lastPage}
          total={pagination.total}
          onPageChange={setPage}
        />
      </Card>
      <OrderFormSheet open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
