import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/shared/components/data-table/data-table";
import { PaginationBar } from "@/modules/finance/components/pagination-bar";
import { paginateClient } from "@/modules/finance/utils";
import { CrmFilters } from "@/modules/crm/components/crm-filters";
import { CrmStatusBadge } from "@/modules/crm/components/crm-status-badge";
import { InvoiceFormSheet } from "@/modules/crm/components/invoice-form-sheet";
import { useCrmInvoices } from "@/hooks/crm/use-crm";
import { formatMoney } from "@/modules/crm/utils";
import type { CrmInvoiceDto } from "@/modules/crm/types";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "issued", label: "Issued" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
  { value: "draft", label: "Draft" },
];

export function InvoicesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const perPage = 15;

  const { data, isLoading } = useCrmInvoices({
    per_page: 200,
    status: status === "all" ? undefined : status,
  });
  const invoices = data?.data ?? [];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return invoices.filter(
      (i) =>
        !q ||
        i.number.toLowerCase().includes(q) ||
        i.customer.toLowerCase().includes(q),
    );
  }, [invoices, search]);

  const { data: rows, pagination } = useMemo(
    () => paginateClient(filtered, page, perPage),
    [filtered, page, perPage],
  );

  const columns: DataTableColumn<CrmInvoiceDto>[] = [
    { id: "number", header: "Invoice #", cell: (i) => <span className="font-medium">{i.number}</span> },
    { id: "customer", header: "Customer", cell: (i) => i.customer },
    {
      id: "issued",
      header: "Issued",
      className: "hidden md:table-cell",
      cell: (i) => i.issued ?? "—",
    },
    {
      id: "due",
      header: "Due",
      className: "hidden md:table-cell",
      cell: (i) => i.due ?? "—",
    },
    {
      id: "status",
      header: "Status",
      cell: (i) => <CrmStatusBadge kind="invoice" status={i.status} />,
    },
    {
      id: "total",
      header: "Total",
      className: "text-right",
      cell: (i) => formatMoney(i.total_amount),
    },
    {
      id: "balance",
      header: "Balance",
      className: "text-right",
      cell: (i) => (
        <span className={i.balance_due > 0 ? "font-semibold text-amber-600" : "text-muted-foreground"}>
          {formatMoney(i.balance_due)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="CRM Invoices"
        description="Issue invoices with AR journals and customer ledger updates."
        breadcrumbs={[{ label: "CRM & Sales" }, { label: "Invoices" }]}
        actions={
          <Button className="gradient-primary border-0 text-primary-foreground" onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Issue Invoice
          </Button>
        }
      />
      <CrmFilters
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search invoices…"
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
          emptyTitle="No invoices"
          emptyDescription="Issue an invoice from an order or ad-hoc lines."
          getRowId={(i) => String(i.id)}
        />
        {pagination.total > 0 ? (
          <PaginationBar pagination={pagination} onPageChange={setPage} />
        ) : null}
      </Card>
      <InvoiceFormSheet open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
