import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/shared/components/data-table/data-table";
import { PaginationBar } from "@/modules/finance/components/pagination-bar";
import { paginateClient } from "@/modules/finance/utils";
import { CrmFilters } from "@/modules/crm/components/crm-filters";
import { PaymentFormSheet } from "@/modules/crm/components/payment-form-sheet";
import { useCrmCustomers, useCrmInvoices, useCrmPayments } from "@/hooks/crm/use-crm";
import { customerLabel, formatMoney } from "@/modules/crm/utils";
import type { CrmPaymentDto } from "@/modules/crm/types";
import { DollarSign, Clock } from "lucide-react";

export function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const perPage = 15;

  const { data, isLoading } = useCrmPayments({ per_page: 200 });
  const { data: customersData } = useCrmCustomers({ per_page: 200 });
  const { data: invoicesData } = useCrmInvoices({ per_page: 200 });

  const customerMap = useMemo(() => {
    const m = new Map<number, string>();
    for (const c of customersData?.data ?? []) m.set(c.id, c.name);
    return m;
  }, [customersData]);

  const payments = data?.data ?? [];
  const openAr = useMemo(
    () =>
      (invoicesData?.data ?? [])
        .filter((i) => i.balance_due > 0)
        .reduce((s, i) => s + i.balance_due, 0),
    [invoicesData],
  );
  const collected = useMemo(() => payments.reduce((s, p) => s + p.amount, 0), [payments]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return payments.filter((p) => {
      const label = customerLabel(p.customer_id, customerMap).toLowerCase();
      return !q || p.number.toLowerCase().includes(q) || label.includes(q);
    });
  }, [payments, search, customerMap]);

  const { data: rows, pagination } = useMemo(
    () => paginateClient(filtered, page, perPage),
    [filtered, page, perPage],
  );

  const columns: DataTableColumn<CrmPaymentDto>[] = [
    { id: "number", header: "Reference", cell: (p) => <span className="font-medium">{p.number}</span> },
    {
      id: "customer",
      header: "Customer",
      cell: (p) => customerLabel(p.customer_id, customerMap),
    },
    {
      id: "date",
      header: "Date",
      className: "hidden md:table-cell",
      cell: (p) => p.payment_date ?? "—",
    },
    {
      id: "method",
      header: "Method",
      className: "hidden md:table-cell",
      cell: (p) => p.method ?? "—",
    },
    {
      id: "amount",
      header: "Amount",
      className: "text-right",
      cell: (p) => <span className="font-semibold tabular-nums">{formatMoney(p.amount)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Collection"
        description="Post customer payments against open invoices (cash / AR)."
        breadcrumbs={[{ label: "CRM & Sales" }, { label: "Payments" }]}
        actions={
          <Button className="gradient-primary border-0 text-primary-foreground" onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Collected (listed)" value={formatMoney(collected)} icon={DollarSign} />
        <StatCard label="Open AR (invoices)" value={formatMoney(openAr)} icon={Clock} accent="bg-amber-500" />
      </div>

      <CrmFilters
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search payments…"
      />

      <Card className="p-4">
        <DataTable
          columns={columns}
          data={rows}
          loading={isLoading}
          emptyTitle="No payments"
          emptyDescription="Record a payment against an issued invoice."
          getRowId={(p) => String(p.id)}
        />
        {pagination.total > 0 ? (
          <PaginationBar pagination={pagination} onPageChange={setPage} />
        ) : null}
      </Card>

      <PaymentFormSheet open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
