import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Plus, Eye, Pencil, ScanBarcode } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/shared/components/data-table/data-table";
import { PaginationBar } from "@/modules/finance/components/pagination-bar";
import { InventoryFilters } from "@/modules/inventory/components/inventory-filters";
import { ProductFormSheet } from "@/modules/inventory/components/product-form-sheet";
import { ProductStatusBadge } from "@/modules/inventory/components/product-status-badge";
import { useInventoryProducts } from "@/hooks/inventory/use-inventory-products";
import { formatMoney, productDisplayStatus } from "@/modules/inventory/utils";
import type { ProductDto } from "@/modules/inventory/types";
import { paginateClient } from "@/modules/finance/utils";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "discontinued", label: "Discontinued" },
];

export function ProductsListPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductDto | null>(null);
  const perPage = 15;

  const { data: result, isLoading } = useInventoryProducts({
    per_page: 200,
    search: search || undefined,
    status: status === "all" ? undefined : status,
  });

  const products = result?.data ?? [];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => {
      const display = productDisplayStatus(p.stock, String(p.status));
      const matchesStatus =
        status === "all" ||
        (status === "active" && display === "active") ||
        String(p.status) === status;
      const matchesSearch =
        !q ||
        p.sku.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (p.barcode ?? "").includes(q) ||
        (p.category_ref?.name ?? p.category ?? "").toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [products, search, status]);

  const { data: rows, pagination } = useMemo(
    () => paginateClient(filtered, page, perPage),
    [filtered, page, perPage],
  );

  const columns: DataTableColumn<ProductDto>[] = [
    {
      id: "sku",
      header: "SKU",
      cell: (p) => (
        <Link to="/app/products/$productId" params={{ productId: String(p.id) }} className="font-mono text-xs font-medium text-primary hover:underline">
          {p.sku}
        </Link>
      ),
    },
    {
      id: "name",
      header: "Product",
      cell: (p) => <span className="font-medium">{p.name}</span>,
    },
    {
      id: "category",
      header: "Category",
      cell: (p) => p.category_ref?.name ?? p.category ?? "—",
    },
    {
      id: "barcode",
      header: "Barcode",
      className: "hidden lg:table-cell",
      cell: (p) => (
        <span className="font-mono text-xs text-muted-foreground">{p.barcode ?? "—"}</span>
      ),
    },
    {
      id: "stock",
      header: "Stock",
      className: "text-right",
      cell: (p) => <span className="tabular-nums">{p.stock}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: (p) => <ProductStatusBadge status={productDisplayStatus(p.stock, String(p.status))} />,
    },
    {
      id: "price",
      header: "Price",
      className: "text-right",
      cell: (p) => <span className="font-semibold tabular-nums">{formatMoney(Number(p.price))}</span>,
    },
    {
      id: "actions",
      header: "",
      className: "w-24 text-right",
      cell: (p) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link to="/app/products/$productId" params={{ productId: String(p.id) }}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setEditProduct(p);
              setFormOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Products"
        description="Product catalog with SKU, barcodes, pricing and stock."
        breadcrumbs={[{ label: "Inventory" }, { label: "Products" }]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/inv/barcode">
                <ScanBarcode className="mr-2 h-4 w-4" />
                Barcodes
              </Link>
            </Button>
            <Button
              size="sm"
              className="gradient-primary border-0 text-primary-foreground"
              onClick={() => {
                setEditProduct(null);
                setFormOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New product
            </Button>
          </div>
        }
      />

      <InventoryFilters
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search SKU, name, barcode, category…"
        status={status}
        onStatusChange={(v) => {
          setStatus(v);
          setPage(1);
        }}
        statusOptions={STATUS_OPTIONS}
      />

      <Card className="p-3 md:p-4">
        <DataTable
          columns={columns}
          data={rows}
          loading={isLoading}
          emptyTitle="No products"
          emptyDescription="Create a product to get started."
          getRowId={(p) => String(p.id)}
        />
        {pagination.total > 0 ? (
          <PaginationBar pagination={pagination} onPageChange={setPage} className="mt-4" />
        ) : null}
      </Card>

      <ProductFormSheet
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditProduct(null);
        }}
        mode={editProduct ? "edit" : "create"}
        product={editProduct}
      />
    </div>
  );
}
