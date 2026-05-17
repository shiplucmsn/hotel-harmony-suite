import { useMemo, useState } from "react";
import { Plus, UserCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { LeadFormSheet } from "@/modules/crm/components/lead-form-sheet";
import { useConvertLead, useCrmLeads } from "@/hooks/crm/use-crm";
import type { CrmLeadDto } from "@/modules/crm/types";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "converted", label: "Converted" },
  { value: "lost", label: "Lost" },
];

export function LeadsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const perPage = 15;

  const { data, isLoading } = useCrmLeads({
    per_page: 200,
    status: status === "all" ? undefined : status,
    search: search || undefined,
  });
  const convertLead = useConvertLead();
  const leads = data?.data ?? [];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return leads.filter(
      (l) =>
        !q ||
        l.name.toLowerCase().includes(q) ||
        (l.company_name ?? "").toLowerCase().includes(q) ||
        (l.email ?? "").toLowerCase().includes(q),
    );
  }, [leads, search]);

  const { data: rows, pagination } = useMemo(
    () => paginateClient(filtered, page, perPage),
    [filtered, page, perPage],
  );

  const columns: DataTableColumn<CrmLeadDto>[] = [
    {
      id: "lead",
      header: "Lead",
      cell: (l) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {l.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-medium">{l.name}</div>
            <div className="text-xs text-muted-foreground">{l.email ?? "—"}</div>
          </div>
        </div>
      ),
    },
    {
      id: "company",
      header: "Company",
      className: "hidden md:table-cell",
      cell: (l) => l.company_name ?? "—",
    },
    {
      id: "source",
      header: "Source",
      className: "hidden lg:table-cell",
      cell: (l) => l.source ?? "—",
    },
    {
      id: "status",
      header: "Status",
      cell: (l) => <CrmStatusBadge kind="lead" status={l.status} />,
    },
    {
      id: "actions",
      header: "",
      className: "w-12",
      cell: (l) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {l.status !== "converted" && (
              <DropdownMenuItem
                disabled={convertLead.isPending}
                onClick={() => convertLead.mutate(l.id)}
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Convert to customer
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
        title="Lead Management"
        description="Capture, qualify and convert prospects into customers."
        breadcrumbs={[{ label: "CRM & Sales" }, { label: "Leads" }]}
        actions={
          <Button className="gradient-primary border-0 text-primary-foreground" onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Lead
          </Button>
        }
      />

      <CrmFilters
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search leads…"
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
          emptyTitle="No leads"
          emptyDescription="Create your first lead to start the pipeline."
          getRowId={(l) => String(l.id)}
        />
        <PaginationBar
          page={pagination.page}
          lastPage={pagination.lastPage}
          total={pagination.total}
          onPageChange={setPage}
        />
      </Card>

      <LeadFormSheet open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
