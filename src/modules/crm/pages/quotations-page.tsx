import { useState } from "react";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DataTable, type DataTableColumn } from "@/shared/components/data-table/data-table";
import { PaginationBar } from "@/modules/finance/components/pagination-bar";
import { CrmFilters } from "@/modules/crm/components/crm-filters";
import { CrmStatusBadge } from "@/modules/crm/components/crm-status-badge";
import { QuotationFormSheet } from "@/modules/crm/components/quotation-form-sheet";
import {
  useConvertQuotation,
  useCrmQuotations,
  useDeleteQuotation,
  useUpdateQuotation,
} from "@/hooks/crm/use-crm";
import { formatMoney } from "@/modules/crm/utils";
import type { CrmQuotationDto } from "@/modules/crm/types";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "expired", label: "Expired" },
];

const emptyPagination = { page: 1, perPage: 15, total: 0, lastPage: 1 };

export function QuotationsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editQuotation, setEditQuotation] = useState<CrmQuotationDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CrmQuotationDto | null>(null);

  const { data, isLoading } = useCrmQuotations({
    page,
    per_page: 15,
    search: search.trim() || undefined,
    status: status === "all" ? undefined : status,
  });
  const updateQuotation = useUpdateQuotation();
  const deleteQuotation = useDeleteQuotation();
  const convertQuotation = useConvertQuotation();

  const quotations = data?.data ?? [];
  const pagination = data?.pagination ?? emptyPagination;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  const columns: DataTableColumn<CrmQuotationDto>[] = [
    {
      id: "number",
      header: "Quote #",
      cell: (q) => <span className="font-medium">{q.number}</span>,
    },
    {
      id: "customer",
      header: "Customer",
      cell: (q) => q.customer,
    },
    {
      id: "date",
      header: "Date",
      className: "hidden md:table-cell",
      cell: (q) => q.date ?? q.quote_date ?? "—",
    },
    {
      id: "expiry",
      header: "Expiry",
      className: "hidden md:table-cell",
      cell: (q) => q.expiry ?? q.valid_until ?? "—",
    },
    {
      id: "status",
      header: "Status",
      cell: (q) => <CrmStatusBadge kind="quotation" status={q.status} />,
    },
    {
      id: "amount",
      header: "Amount",
      className: "text-right",
      cell: (q) => <span className="font-semibold">{formatMoney(q.amount ?? q.total_amount)}</span>,
    },
    {
      id: "actions",
      header: "",
      className: "w-10",
      cell: (q) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setEditQuotation(q);
                setFormOpen(true);
              }}
            >
              Edit
            </DropdownMenuItem>
            {q.status === "draft" ? (
              <DropdownMenuItem
                onClick={() =>
                  updateQuotation.mutate({ id: q.id, body: { status: "sent" } })
                }
              >
                Mark as sent
              </DropdownMenuItem>
            ) : null}
            {q.status !== "accepted" ? (
              <DropdownMenuItem
                disabled={convertQuotation.isPending}
                onClick={() => convertQuotation.mutate(q.id)}
              >
                Convert to order
              </DropdownMenuItem>
            ) : null}
            {q.status !== "accepted" ? (
              <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(q)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
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
        title="Quotation System"
        description="Create, send, and track quotations from the database."
        breadcrumbs={[{ label: "CRM & Sales" }, { label: "Quotations" }]}
        actions={
          <Button
            className="gradient-primary w-full border-0 text-primary-foreground sm:w-auto"
            onClick={() => {
              setEditQuotation(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Quote
          </Button>
        }
      />

      <CrmFilters
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search quotes…"
        status={status}
        onStatusChange={handleStatusChange}
        statusOptions={STATUS_OPTIONS}
      />

      <Card className="p-4">
        <DataTable
          columns={columns}
          data={quotations}
          loading={isLoading}
          emptyTitle="No quotations"
          emptyDescription={
            search.trim() || status !== "all"
              ? "No quotes match your filters."
              : "Create your first quotation to send to customers."
          }
          getRowId={(q) => String(q.id)}
        />
        {pagination.total > 0 ? (
          <PaginationBar pagination={pagination} onPageChange={setPage} className="mt-4" />
        ) : null}
      </Card>

      <QuotationFormSheet
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditQuotation(null);
        }}
        quotation={editQuotation}
      />

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete quotation?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `Quote ${deleteTarget.number} will be permanently removed.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row">
            <AlertDialogCancel disabled={deleteQuotation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteQuotation.isPending}
              onClick={() => {
                if (!deleteTarget) return;
                deleteQuotation.mutate(deleteTarget.id, {
                  onSuccess: () => setDeleteTarget(null),
                });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
