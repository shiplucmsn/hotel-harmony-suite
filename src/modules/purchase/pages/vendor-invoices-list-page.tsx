import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { useSupplierInvoices } from "@/hooks/purchase/use-purchase";
import { formatMoney, purchaseStatusTone } from "@/modules/purchase/utils";

export function VendorInvoicesListPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");

  const { data, isLoading } = useSupplierInvoices({
    page,
    per_page: 20,
    status: status || undefined,
  });
  const invoices = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supplier invoices"
        description="3-way match supplier bills against GRN and PO, then approve for payment."
        breadcrumbs={[{ label: "Purchases" }, { label: "Supplier invoices" }]}
      />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <Select value={status || "all"} onValueChange={(v) => setStatus(v === "all" ? "" : v)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="matched">Matched</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
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
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && invoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground">
                    No invoices. Create one from a posted GRN.
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
    </div>
  );
}
