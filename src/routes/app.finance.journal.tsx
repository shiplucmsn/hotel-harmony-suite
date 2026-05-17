import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Eye, Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/shared/components/data-table/data-table";
import { FinancialFilters } from "@/modules/finance/components/financial-filters";
import { JournalStatusBadge } from "@/modules/finance/components/journal-status-badge";
import { JournalEntrySheet } from "@/modules/finance/components/journal-entry-sheet";
import { JournalDetailSheet } from "@/modules/finance/components/journal-detail-sheet";
import { PaginationBar } from "@/modules/finance/components/pagination-bar";
import { useFinanceAccounts } from "@/hooks/finance/use-finance-accounts";
import { useJournalEntries } from "@/hooks/finance/use-journal-entries";
import { formatMoney, journalLineTotals } from "@/modules/finance/utils";
import type { JournalEntryDto, JournalStatus } from "@/modules/finance/types";

export const Route = createFileRoute("/app/finance/journal")({ component: JournalPage });

const STATUS_OPTIONS = [
  { value: "all", label: "All status" },
  { value: "posted", label: "Posted" },
  { value: "reversed", label: "Reversed" },
  { value: "draft", label: "Draft" },
];

function JournalPage() {
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [detailEntry, setDetailEntry] = useState<JournalEntryDto | null>(null);
  const perPage = 15;

  const { data: accounts = [] } = useFinanceAccounts();
  const { data: result, isLoading } = useJournalEntries(page, perPage);

  const entries = result?.data ?? [];
  const serverPagination = result?.pagination;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return entries.filter((j) => {
      const matchesSearch =
        !q ||
        j.entry_number.toLowerCase().includes(q) ||
        (j.memo ?? "").toLowerCase().includes(q) ||
        (j.reference_id ?? "").toLowerCase().includes(q);
      const matchesStatus = status === "all" || j.status === status;
      const matchesFrom = !dateFrom || j.entry_date >= dateFrom;
      const matchesTo = !dateTo || j.entry_date <= dateTo;
      return matchesSearch && matchesStatus && matchesFrom && matchesTo;
    });
  }, [entries, search, status, dateFrom, dateTo]);

  const columns = [
    {
      id: "number",
      header: "Number",
      cell: (j: JournalEntryDto) => <span className="font-mono text-xs">{j.entry_number}</span>,
    },
    { id: "date", header: "Date", cell: (j: JournalEntryDto) => j.entry_date },
    {
      id: "reference",
      header: "Reference",
      cell: (j: JournalEntryDto) => (
        <span className="text-muted-foreground">
          {[j.reference_type, j.reference_id].filter(Boolean).join(" / ") || "—"}
        </span>
      ),
    },
    {
      id: "memo",
      header: "Memo",
      cell: (j: JournalEntryDto) => <span className="font-medium">{j.memo ?? "—"}</span>,
    },
    {
      id: "debit",
      header: "Debit",
      className: "text-right",
      cell: (j: JournalEntryDto) => {
        const { debit } = journalLineTotals(j.lines ?? []);
        return <span className="tabular-nums">{formatMoney(debit)}</span>;
      },
    },
    {
      id: "credit",
      header: "Credit",
      className: "text-right",
      cell: (j: JournalEntryDto) => {
        const { credit } = journalLineTotals(j.lines ?? []);
        return <span className="tabular-nums">{formatMoney(credit)}</span>;
      },
    },
    {
      id: "status",
      header: "Status",
      cell: (j: JournalEntryDto) => <JournalStatusBadge status={j.status as JournalStatus} />,
    },
    {
      id: "actions",
      header: "",
      className: "w-10",
      cell: (j: JournalEntryDto) => (
        <Button size="sm" variant="ghost" onClick={() => setDetailEntry(j)}>
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Journal Entries"
        description="Manual debit/credit postings to your ledger."
        breadcrumbs={[{ label: "Finance" }, { label: "Journal" }]}
        actions={
          <Button
            size="sm"
            className="gradient-primary border-0 text-primary-foreground"
            onClick={() => setFormOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            New entry
          </Button>
        }
      />

      <FinancialFilters
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search entries…"
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        status={status}
        onStatusChange={setStatus}
        statusOptions={STATUS_OPTIONS}
      />

      <Card className="overflow-hidden p-0">
        <div className="p-4">
          <DataTable
            columns={columns}
            data={filtered}
            loading={isLoading}
            emptyTitle="No journal entries"
            emptyDescription="Post a journal entry to see it here."
            getRowId={(j) => String(j.id)}
          />
        </div>
        {serverPagination && serverPagination.total > 0 ? (
          <PaginationBar pagination={serverPagination} onPageChange={setPage} />
        ) : null}
      </Card>

      <JournalEntrySheet open={formOpen} onOpenChange={setFormOpen} accounts={accounts} />
      <JournalDetailSheet
        entry={detailEntry}
        open={detailEntry != null}
        onOpenChange={(open) => !open && setDetailEntry(null)}
      />
    </div>
  );
}
