import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/shared/components/data-table/data-table";
import { FinancialFilters } from "@/modules/finance/components/financial-filters";
import { AccountTypeBadge } from "@/modules/finance/components/account-type-badge";
import { AccountFormSheet } from "@/modules/finance/components/account-form-sheet";
import { PaginationBar } from "@/modules/finance/components/pagination-bar";
import { useFinanceAccounts } from "@/hooks/finance/use-finance-accounts";
import { formatMoney, paginateClient } from "@/modules/finance/utils";
import type { FinanceAccountDto } from "@/modules/finance/types";

export const Route = createFileRoute("/app/finance/accounts")({ component: AccountsPage });

const TYPE_OPTIONS = [
  { value: "all", label: "All types" },
  { value: "asset", label: "Asset" },
  { value: "liability", label: "Liability" },
  { value: "equity", label: "Equity" },
  { value: "revenue", label: "Revenue" },
  { value: "expense", label: "Expense" },
];

function AccountsPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const perPage = 15;

  const { data: accounts = [], isLoading } = useFinanceAccounts();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return accounts.filter((a) => {
      const matchesType = type === "all" || a.type === type;
      const matchesSearch =
        !q || a.code.toLowerCase().includes(q) || a.name.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [accounts, search, type]);

  const { data: rows, pagination } = useMemo(
    () => paginateClient(filtered, page, perPage),
    [filtered, page, perPage]
  );

  const columns = [
    {
      id: "code",
      header: "Code",
      cell: (a: FinanceAccountDto) => <span className="font-mono text-xs">{a.code}</span>,
    },
    {
      id: "name",
      header: "Name",
      cell: (a: FinanceAccountDto) => <span className="font-medium">{a.name}</span>,
    },
    {
      id: "type",
      header: "Type",
      cell: (a: FinanceAccountDto) => <AccountTypeBadge type={a.type} />,
    },
    {
      id: "balance",
      header: "Balance",
      className: "text-right",
      cell: (a: FinanceAccountDto) => (
        <span className="font-semibold tabular-nums">{formatMoney(a.balance, a.currency_code)}</span>
      ),
    },
    {
      id: "currency",
      header: "Currency",
      cell: (a: FinanceAccountDto) => a.currency_code,
    },
    {
      id: "status",
      header: "Status",
      cell: (a: FinanceAccountDto) => (
        <Badge
          variant="outline"
          className={
            a.is_active
              ? "border-success/20 bg-success/15 text-success"
              : "border-border bg-muted text-muted-foreground"
          }
        >
          {a.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chart of Accounts"
        description="Define and organize your general ledger accounts."
        breadcrumbs={[{ label: "Finance" }, { label: "Chart of Accounts" }]}
        actions={
          <Button
            size="sm"
            className="gradient-primary border-0 text-primary-foreground"
            onClick={() => setFormOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            New account
          </Button>
        }
      />

      <FinancialFilters
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search code or name…"
        type={type}
        onTypeChange={(v) => {
          setType(v);
          setPage(1);
        }}
        typeOptions={TYPE_OPTIONS}
      />

      <Card className="overflow-hidden p-0">
        <div className="p-4">
          <DataTable
            columns={columns}
            data={rows}
            loading={isLoading}
            emptyTitle="No accounts"
            emptyDescription="Create an account or seed the chart of accounts for this tenant."
            getRowId={(a) => String(a.id)}
          />
        </div>
        {pagination.total > 0 ? (
          <PaginationBar pagination={pagination} onPageChange={setPage} />
        ) : null}
      </Card>

      <AccountFormSheet open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
