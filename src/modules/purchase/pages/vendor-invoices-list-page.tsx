import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { FileText, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationBar } from "@/modules/finance/components/pagination-bar";
import { CreateSupplierInvoiceDialog } from "@/modules/purchase/components/create-supplier-invoice-dialog";
import {
  usePurchaseApSummary,
  useSupplierInvoices,
  useSuppliers,
} from "@/hooks/purchase/use-purchase";
import { usePermissions } from "@/hooks/rbac/use-permissions";
import { formatMoney, purchaseStatusTone } from "@/modules/purchase/utils";

export function VendorInvoicesListPage() {
  const navigate = useNavigate();
  const { can } = usePermissions();
  const canManage = can("purchase.invoices.manage");

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const listParams = useMemo(
    () => ({
      page,
      per_page: 20,
      status: status || undefined,
      supplier_id: supplierId ? Number(supplierId) : undefined,
      search: search || undefined,
    }),
    [page, status, supplierId, search],
  );

  const { data, isLoading, isFetching } = useSupplierInvoices(listParams);
  const { data: apSummary } = usePurchaseApSummary();
  const { data: suppliersData } = useSuppliers({ per_page: 100 });
  const suppliers = suppliersData?.data ?? [];

  const invoices = data?.data ?? [];
  const pagination = data?.pagination;

  const applySearch = () => {
    setSearch(searchInput.trim());
    setPage(1);
  };

  const draftCount = useMemo(
    () => invoices.filter((i) => i.status === "draft" || i.status === "matched").length,
    [invoices],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supplier invoices"
        description="3-way match supplier bills against GRN and PO, then approve for payment."
        breadcrumbs={[{ label: "Purchases" }, { label: "Supplier invoices" }]}
        actions={
          canManage ? (
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New invoice
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase text-muted-foreground">AP outstanding</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {apSummary ? formatMoney(apSummary.total_outstanding) : "—"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {apSummary?.supplier_count ?? 0} suppliers with balance
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase text-muted-foreground">Aging 0–30 days</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {apSummary ? formatMoney(apSummary.aging.current_0_30) : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase text-muted-foreground">This page (filtered)</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{pagination?.total ?? invoices.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {isFetching ? "Refreshing…" : `${draftCount} awaiting match/approve on this page`}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <div className="flex min-w-[200px] flex-1 items-center gap-2">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              placeholder="Invoice # or vendor ref…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applySearch()}
            />
            <Button type="button" variant="secondary" size="sm" onClick={applySearch}>
              Search
            </Button>
          </div>
          <Select value={supplierId || "all"} onValueChange={(v) => { setSupplierId(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All suppliers</SelectItem>
              {suppliers.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status || "all"} onValueChange={(v) => { setStatus(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="matched">Matched</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Vendor ref</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Match</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={8} className="text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && invoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-muted-foreground">
                    No invoices yet.{" "}
                    {canManage ? "Create one from a posted GRN." : "Ask an admin for invoice manage permission."}
                  </TableCell>
                </TableRow>
              )}
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>
                    <Link
                      to="/app/inv/vendor-invoices/$invoiceId"
                      params={{ invoiceId: String(inv.id) }}
                      className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      {inv.number}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm">{inv.vendor_invoice_number ?? "—"}</TableCell>
                  <TableCell>{inv.supplier?.name ?? inv.supplier_id}</TableCell>
                  <TableCell className="text-sm">{inv.invoice_date ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={purchaseStatusTone(inv.status)}>
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{inv.match_status ?? "—"}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(inv.total_amount)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(inv.balance_due)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {pagination && (
            <PaginationBar pagination={pagination} onPageChange={setPage} className="border-t px-4 py-3" />
          )}
        </CardContent>
      </Card>

      {canManage && (
        <CreateSupplierInvoiceDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={(id) =>
            navigate({
              to: "/app/inv/vendor-invoices/$invoiceId",
              params: { invoiceId: String(id) },
            })
          }
        />
      )}
    </div>
  );
}
