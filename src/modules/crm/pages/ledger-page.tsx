import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Download, Filter, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/shared/components/forms/searchable-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationBar } from "@/modules/finance/components/pagination-bar";
import { useCrmCustomer, useCrmCustomers, useCustomerLedger } from "@/hooks/crm/use-crm";
import { formatMoney } from "@/modules/crm/utils";
import { customerSelectOptions } from "@/modules/crm/utils/select-options";
import type { CustomerLedgerEntryDto } from "@/modules/crm/types";

const emptyPagination = { page: 1, perPage: 20, total: 0, lastPage: 1 };

function formatReference(entry: CustomerLedgerEntryDto): string {
  if (entry.reference_type && entry.reference_id) {
    return `${entry.reference_type} #${entry.reference_id}`;
  }

  return entry.entry_type ?? "—";
}

export function LedgerPage() {
  const [customerId, setCustomerId] = useState<string>("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [applied, setApplied] = useState<{ from?: string; to?: string }>({});
  const [page, setPage] = useState(1);

  const { data: customersData, isLoading: customersLoading } = useCrmCustomers({ per_page: 200 });
  const customers = customersData?.data ?? [];
  const customerOptions = useMemo(
    () =>
      customerSelectOptions(customers).map((o) => {
        const c = customers.find((x) => String(x.id) === o.value);
        if (c && c.balance > 0) {
          return { ...o, label: `${c.name} · ${formatMoney(c.balance)}` };
        }
        return o;
      }),
    [customers],
  );

  const selectedId = customerId ? Number(customerId) : undefined;
  const { data: customerData } = useCrmCustomer(selectedId);
  const { data: ledgerData, isLoading: ledgerLoading, isFetching } = useCustomerLedger(selectedId, {
    ...applied,
    page,
    per_page: 20,
  });

  const entries = ledgerData?.data ?? [];
  const pagination = ledgerData?.pagination ?? emptyPagination;
  const summary = ledgerData?.summary;

  const totals = useMemo(
    () => ({
      debit: summary?.total_debit ?? 0,
      credit: summary?.total_credit ?? 0,
      outstanding: summary?.outstanding ?? customerData?.balance ?? 0,
    }),
    [summary, customerData?.balance],
  );

  const handleApply = () => {
    setApplied({
      from: from || undefined,
      to: to || undefined,
    });
    setPage(1);
  };

  const handleCustomerChange = (value: string) => {
    setCustomerId(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Ledger"
        description="Per-customer statement of account with running balance from the database."
        breadcrumbs={[{ label: "CRM & Sales" }, { label: "Customer Ledger" }]}
        actions={
          <Button variant="outline" disabled title="Export coming soon">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="grid gap-3 sm:grid-cols-4">
            <SearchableSelect
              value={customerId}
              onValueChange={handleCustomerChange}
              options={customerOptions}
              placeholder={customersLoading ? "Loading…" : "Select customer"}
              searchPlaceholder="Search customers…"
              disabled={customersLoading}
            />
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From date" />
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To date" />
            <Button variant="outline" onClick={handleApply} disabled={!customerId}>
              <Filter className="mr-2 h-4 w-4" />
              Apply
            </Button>
          </div>

          {!customerId ? (
            <p className="text-sm text-muted-foreground">Select a customer to view their ledger statement.</p>
          ) : (
            <>
              {customerData ? (
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <div>
                    <span className="font-medium">{customerData.name}</span>
                    {customerData.code ? (
                      <span className="ml-2 text-muted-foreground">({customerData.code})</span>
                    ) : null}
                  </div>
                  <Link
                    to="/app/crm/customers/$customerId"
                    params={{ customerId: String(customerData.id) }}
                    className="text-primary hover:underline"
                  >
                    View customer profile
                  </Link>
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border p-4">
                  <div className="text-xs text-muted-foreground">Total debit</div>
                  <div className="mt-1 text-xl font-semibold tabular-nums">
                    {ledgerLoading ? "…" : formatMoney(totals.debit)}
                  </div>
                </div>
                <div className="rounded-xl border p-4">
                  <div className="text-xs text-muted-foreground">Total credit</div>
                  <div className="mt-1 text-xl font-semibold tabular-nums">
                    {ledgerLoading ? "…" : formatMoney(totals.credit)}
                  </div>
                </div>
                <div className="rounded-xl border bg-primary/5 p-4">
                  <div className="text-xs text-muted-foreground">Outstanding (AR)</div>
                  <div className="mt-1 text-xl font-semibold text-primary tabular-nums">
                    {ledgerLoading ? "…" : formatMoney(totals.outstanding)}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border">
                {ledgerLoading || isFetching ? (
                  <div className="flex items-center justify-center gap-2 p-8 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading ledger…
                  </div>
                ) : entries.length === 0 ? (
                  <p className="p-8 text-center text-sm text-muted-foreground">
                    No ledger entries for this customer
                    {applied.from || applied.to ? " in the selected date range" : ""}.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Debit</TableHead>
                        <TableHead className="text-right">Credit</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entries.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell className="text-muted-foreground">{e.entry_date ?? "—"}</TableCell>
                          <TableCell className="font-medium">{formatReference(e)}</TableCell>
                          <TableCell>{e.description ?? "—"}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {e.debit > 0 ? formatMoney(e.debit) : "—"}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {e.credit > 0 ? formatMoney(e.credit) : "—"}
                          </TableCell>
                          <TableCell className="text-right font-semibold tabular-nums">
                            {formatMoney(e.balance_after)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              {pagination.total > 0 ? (
                <PaginationBar pagination={pagination} onPageChange={setPage} />
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
