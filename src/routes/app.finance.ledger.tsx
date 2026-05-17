import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/shared/components/data-table/data-table";
import { FinancialFilters } from "@/modules/finance/components/financial-filters";
import { PaginationBar } from "@/modules/finance/components/pagination-bar";
import { useFinanceAccounts } from "@/hooks/finance/use-finance-accounts";
import { useLedgerEntries } from "@/hooks/finance/use-ledger";
import { formatMoney } from "@/modules/finance/utils";
import type { LedgerEntryDto } from "@/modules/finance/types";

export const Route = createFileRoute("/app/finance/ledger")({ component: LedgerPage });

function LedgerPage() {
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [accountCode, setAccountCode] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 20;

  const { data: accounts = [] } = useFinanceAccounts();
  const { data: result, isLoading } = useLedgerEntries(
    page,
    perPage,
    accountCode !== "all" ? accountCode : undefined
  );

  const entries = result?.data ?? [];
  const pagination = result?.pagination;

  const accountOptions = useMemo(
    () => [
      { value: "all", label: "All accounts" },
      ...accounts.map((a) => ({ value: a.code, label: `${a.code} — ${a.name}` })),
    ],
    [accounts]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return entries.filter((e) => {
      const matchesSearch =
        !q ||
        e.account_code.toLowerCase().includes(q) ||
        (e.memo ?? "").toLowerCase().includes(q) ||
        (e.reference_id ?? "").toLowerCase().includes(q);
      const matchesFrom = !dateFrom || e.entry_date >= dateFrom;
      const matchesTo = !dateTo || e.entry_date <= dateTo;
      return matchesSearch && matchesFrom && matchesTo;
    });
  }, [entries, search, dateFrom, dateTo]);

  const columns = [
    { id: "date", header: "Date", cell: (e: LedgerEntryDto) => e.entry_date },
    {
      id: "account",
      header: "Account",
      cell: (e: LedgerEntryDto) => <span className="font-mono text-xs font-medium">{e.account_code}</span>,
    },
    {
      id: "reference",
      header: "Reference",
      cell: (e: LedgerEntryDto) => (
        <span className="font-mono text-xs text-muted-foreground">
          {[e.reference_type, e.reference_id].filter(Boolean).join(" / ") || "—"}
        </span>
      ),
    },
    {
      id: "memo",
      header: "Description",
      cell: (e: LedgerEntryDto) => e.memo ?? "—",
    },
    {
      id: "debit",
      header: "Debit",
      className: "text-right",
      cell: (e: LedgerEntryDto) => (
        <span className="tabular-nums">{e.debit > 0 ? formatMoney(e.debit) : "—"}</span>
      ),
    },
    {
      id: "credit",
      header: "Credit",
      className: "text-right",
      cell: (e: LedgerEntryDto) => (
        <span className="tabular-nums">{e.credit > 0 ? formatMoney(e.credit) : "—"}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="General Ledger"
        description="Detailed account-level transaction history."
        breadcrumbs={[{ label: "Finance" }, { label: "Ledger" }]}
      />

      <FinancialFilters
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search ledger…"
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        accountCode={accountCode}
        onAccountChange={(v) => {
          setAccountCode(v);
          setPage(1);
        }}
        accountOptions={accountOptions}
      />

      <Card className="overflow-hidden p-0">
        <div className="p-4">
          <DataTable
            columns={columns}
            data={filtered}
            loading={isLoading}
            emptyTitle="No ledger entries"
            emptyDescription="Post journal entries to populate the general ledger."
            getRowId={(e) => String(e.id)}
          />
        </div>
        {pagination && pagination.total > 0 ? (
          <PaginationBar pagination={pagination} onPageChange={setPage} />
        ) : null}
      </Card>
    </div>
  );
}
