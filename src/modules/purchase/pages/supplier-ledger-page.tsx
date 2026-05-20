import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationBar } from "@/modules/finance/components/pagination-bar";
import { useSupplier, useSupplierLedger, useSuppliers } from "@/hooks/purchase/use-purchase";
import { formatMoney, supplierInitials } from "@/modules/purchase/utils";

type SupplierLedgerPageProps = {
  initialSupplierId?: number;
};

export function SupplierLedgerPage({ initialSupplierId }: SupplierLedgerPageProps) {
  const [supplierId, setSupplierId] = useState<number | undefined>(initialSupplierId);
  const [page, setPage] = useState(1);

  const { data: suppliersRes } = useSuppliers({ per_page: 200, status: "active" });
  const suppliers = suppliersRes?.data ?? [];

  const activeId = supplierId ?? suppliers[0]?.id;
  const { data: supplier } = useSupplier(activeId);
  const { data: ledgerRes, isLoading } = useSupplierLedger(activeId, { page, per_page: 25 });
  const entries = ledgerRes?.data ?? [];
  const pagination = ledgerRes?.pagination;

  const totals = useMemo(() => {
    let debit = 0;
    let credit = 0;
    for (const e of entries) {
      debit += e.debit;
      credit += e.credit;
    }
    return { debit, credit };
  }, [entries]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supplier Ledger"
        description="Statement of accounts per supplier (GRN credits, payments debits)."
        breadcrumbs={[{ label: "Purchases" }, { label: "Ledger" }]}
        actions={
          <Button size="sm" variant="outline" asChild>
            <Link to="/app/inv/suppliers">All suppliers</Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {supplier ? (
              <>
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="gradient-primary text-primary-foreground">
                    {supplierInitials(supplier.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{supplier.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {supplier.email ?? "—"} · {supplier.code}
                  </p>
                </div>
              </>
            ) : (
              <Skeleton className="h-12 w-48" />
            )}
          </div>
          <Select
            value={activeId ? String(activeId) : ""}
            onValueChange={(v) => {
              setSupplierId(Number(v));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select supplier" />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Ledger debits</p>
            <p className="mt-2 text-2xl font-semibold">{formatMoney(totals.debit)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Ledger credits</p>
            <p className="mt-2 text-2xl font-semibold text-success">{formatMoney(totals.credit)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Outstanding (AP)</p>
            <p className="mt-2 text-2xl font-semibold text-warning">
              {formatMoney(supplier?.balance ?? 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Statement of account</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Loading ledger…
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && entries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No ledger entries yet for this supplier.
                  </TableCell>
                </TableRow>
              )}
              {entries.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="text-muted-foreground">{e.entry_date ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{e.entry_type ?? e.reference_type ?? "—"}</TableCell>
                  <TableCell>{e.description ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    {e.debit > 0 ? formatMoney(e.debit) : "—"}
                  </TableCell>
                  <TableCell className="text-right text-success">
                    {e.credit > 0 ? formatMoney(e.credit) : "—"}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {formatMoney(e.balance_after)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        {pagination && pagination.lastPage > 1 && (
          <PaginationBar pagination={pagination} onPageChange={setPage} />
        )}
      </Card>
    </div>
  );
}
