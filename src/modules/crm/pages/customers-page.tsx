import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DataTable, type DataTableColumn } from "@/shared/components/data-table/data-table";
import { PaginationBar } from "@/modules/finance/components/pagination-bar";
import { paginateClient } from "@/modules/finance/utils";
import { CrmFilters } from "@/modules/crm/components/crm-filters";
import { CustomerFormSheet } from "@/modules/crm/components/customer-form-sheet";
import { useCrmCustomers } from "@/hooks/crm/use-crm";
import { formatMoney } from "@/modules/crm/utils";
import type { CrmCustomerDto } from "@/modules/crm/types";

export function CustomersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const perPage = 15;

  const { data, isLoading } = useCrmCustomers({ per_page: 200, search: search || undefined });
  const customers = data?.data ?? [];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.code ?? "").toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q),
    );
  }, [customers, search]);

  const { data: rows, pagination } = useMemo(
    () => paginateClient(filtered, page, perPage),
    [filtered, page, perPage],
  );

  const columns: DataTableColumn<CrmCustomerDto>[] = [
    {
      id: "customer",
      header: "Customer",
      cell: (c) => (
        <Link
          to="/app/crm/customers/$customerId"
          params={{ customerId: String(c.id) }}
          className="flex items-center gap-3 hover:underline"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="gradient-primary text-xs text-primary-foreground">
              {c.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-medium">{c.name}</div>
            <div className="text-xs text-muted-foreground">{c.code ?? `ID ${c.id}`}</div>
          </div>
        </Link>
      ),
    },
    {
      id: "contact",
      header: "Contact",
      className: "hidden lg:table-cell",
      cell: (c) => (
        <div className="text-xs">
          <div>{c.email ?? "—"}</div>
          <div className="text-muted-foreground">{c.phone ?? ""}</div>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (c) => (
        <span
          className={
            c.status === "active"
              ? "rounded-full bg-success/10 px-2 py-0.5 text-xs text-success"
              : "rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
          }
        >
          {c.status}
        </span>
      ),
    },
    {
      id: "balance",
      header: "AR Balance",
      className: "text-right",
      cell: (c) => <span className="font-semibold tabular-nums">{formatMoney(c.balance)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Management"
        description="View balances, ledger history and linked sales documents."
        breadcrumbs={[{ label: "CRM & Sales" }, { label: "Customers" }]}
        actions={
          <Button className="gradient-primary border-0 text-primary-foreground" onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Customer
          </Button>
        }
      />

      <CrmFilters
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search customers…"
      />

      <Card className="p-4">
        <DataTable
          columns={columns}
          data={rows}
          loading={isLoading}
          emptyTitle="No customers"
          emptyDescription="Add a customer to start invoicing and orders."
          getRowId={(c) => String(c.id)}
        />
        {pagination.total > 0 ? (
          <PaginationBar pagination={pagination} onPageChange={setPage} />
        ) : null}
      </Card>

      <CustomerFormSheet open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}