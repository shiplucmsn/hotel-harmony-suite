import { useDeferredValue, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Mail, Phone, Plus, Search, ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaginationBar } from "@/modules/finance/components/pagination-bar";
import { SupplierFormSheet } from "@/modules/purchase/components/supplier-form-sheet";
import { useSuppliers } from "@/hooks/purchase/use-purchase";
import { formatMoney, purchaseStatusTone, supplierInitials } from "@/modules/purchase/utils";
import type { SupplierDto } from "@/modules/purchase/types";

export function SuppliersListPage() {
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState<SupplierDto | null>(null);
  const deferredSearch = useDeferredValue(search);

  const listParams = useMemo(
    () => ({
      page,
      per_page: 12,
      search: deferredSearch || undefined,
      status: statusTab === "all" ? undefined : statusTab,
    }),
    [page, deferredSearch, statusTab],
  );

  const { data, isLoading, isFetching } = useSuppliers(listParams);
  const suppliers = data?.data ?? [];
  const pagination = data?.pagination;
  const loading = isLoading || isFetching;

  const openCreate = () => {
    setEditSupplier(null);
    setFormOpen(true);
  };

  const openEdit = (s: SupplierDto) => {
    setEditSupplier(s);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supplier Management"
        description="Vendor directory for purchase orders, GRN, and payments."
        breadcrumbs={[{ label: "Purchases" }, { label: "Suppliers" }]}
        actions={
          <Button
            size="sm"
            className="gradient-primary border-0 text-primary-foreground"
            onClick={openCreate}
          >
            <Plus className="mr-2 h-4 w-4" />
            New supplier
          </Button>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by name or code…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Tabs
            value={statusTab}
            onValueChange={(v) => {
              setStatusTab(v as typeof statusTab);
              setPage(1);
            }}
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {loading && suppliers.length === 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : suppliers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No suppliers found. Create your first supplier to start purchasing.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((s) => (
            <Card key={s.id} className="transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="h-12 w-12 shrink-0">
                      <AvatarFallback className="gradient-primary text-primary-foreground">
                        {supplierInitials(s.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <CardTitle className="truncate text-base">{s.name}</CardTitle>
                      <p className="font-mono text-xs text-muted-foreground">{s.code}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={purchaseStatusTone(s.status)}>
                    {s.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {s.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="truncate">{s.email}</span>
                  </div>
                )}
                {s.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>{s.phone}</span>
                  </div>
                )}
                {s.payment_terms && (
                  <p className="text-xs text-muted-foreground">Terms: {s.payment_terms}</p>
                )}
                <div className="flex items-center justify-between border-t pt-2">
                  <span className="text-sm text-muted-foreground">AP balance</span>
                  <span className="font-semibold tabular-nums">{formatMoney(s.balance)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      to="/app/inv/supplier-ledger"
                      search={{ supplier_id: s.id }}
                    >
                      Ledger
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      to="/app/inv/purchase-orders"
                      search={{ supplier_id: s.id, new_po: 1 }}
                    >
                      <ShoppingBag className="mr-1 h-3.5 w-3.5" />
                      PO
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/app/inv/grn" search={{ supplier_id: s.id, new_grn: 1 }}>
                      GRN
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      to="/app/inv/vendor-payments"
                      search={{ supplier_id: s.id }}
                    >
                      Pay
                    </Link>
                  </Button>
                </div>
                <Button variant="ghost" size="sm" className="w-full" onClick={() => openEdit(s)}>
                  Edit supplier
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {pagination && pagination.lastPage > 1 && (
        <PaginationBar pagination={pagination} onPageChange={setPage} />
      )}

      <SupplierFormSheet open={formOpen} onOpenChange={setFormOpen} supplier={editSupplier} />
    </div>
  );
}
