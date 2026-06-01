import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertCircle, Layers, MoreHorizontal, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkuPicker } from "@/shared/components/forms/sku-picker";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaginationBar } from "@/modules/finance/components/pagination-bar";
import { SupplierSelect } from "@/modules/purchase/components/supplier-select";
import { usePermissions } from "@/hooks/rbac/use-permissions";
import {
  useProductionRawMaterials,
  useRegisterProductionRawMaterial,
} from "@/hooks/production/use-production";
import { toast } from "sonner";

function stockTone(status: string) {
  if (status === "ok") return "bg-success/15 text-success border-success/30";
  if (status === "low") return "bg-warning/15 text-warning border-warning/30";
  return "bg-destructive/15 text-destructive border-destructive/30";
}

function stockLabel(status: string) {
  if (status === "ok") return "In stock";
  if (status === "low") return "Low";
  return "Out";
}

function formatMoney(value: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(value);
}

export function RawMaterialsPage() {
  const { can } = usePermissions();
  const canManage = can("production.materials.manage");

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState<"all" | "bom">("all");
  const [lowOnly, setLowOnly] = useState(false);
  const [open, setOpen] = useState(false);

  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [productId, setProductId] = useState<number | null>(null);
  const [reorderPoint, setReorderPoint] = useState("10");
  const [costPrice, setCostPrice] = useState("");
  const [openingQty, setOpeningQty] = useState("");
  const [supplierId, setSupplierId] = useState("");

  const listParams = useMemo(
    () => ({
      page,
      per_page: 20,
      search: search || undefined,
      scope: scope === "bom" ? "bom" : undefined,
      stock_status: lowOnly ? "low" : undefined,
    }),
    [page, search, scope, lowOnly],
  );

  const { data, isLoading, isError, isFetching } = useProductionRawMaterials(listParams);
  const register = useRegisterProductionRawMaterial();
  const materials = data?.data ?? [];
  const pagination = data?.pagination;

  function resetForm() {
    setSku("");
    setName("");
    setProductId(null);
    setReorderPoint("10");
    setCostPrice("");
    setOpeningQty("");
    setSupplierId("");
  }

  function submitMaterial() {
    if (!canManage) {
      toast.error("You do not have permission to manage raw materials");
      return;
    }
    if (!sku.trim() && !productId) {
      toast.error("Select or enter a SKU");
      return;
    }
    if (!productId && !name.trim()) {
      toast.error("Name is required for new SKUs");
      return;
    }

    register.mutate(
      {
        product_id: productId ?? undefined,
        sku: sku.trim() || undefined,
        name: name.trim() || undefined,
        reorder_point: Number(reorderPoint || 10),
        cost_price: costPrice ? Number(costPrice) : undefined,
        supplier_id: supplierId ? Number(supplierId) : undefined,
        opening_qty: openingQty ? Number(openingQty) : undefined,
      },
      {
        onSuccess: () => {
          setOpen(false);
          resetForm();
        },
      },
    );
  }

  const applySearch = () => {
    setSearch(searchInput.trim());
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Raw Materials"
        description="Tracked inventory items consumed in production, with preferred suppliers from purchase."
        breadcrumbs={[{ label: "Production" }, { label: "Raw Materials" }]}
        actions={
          canManage ? (
            <Sheet
              open={open}
              onOpenChange={(next) => {
                setOpen(next);
                if (!next) resetForm();
              }}
            >
              <SheetTrigger asChild>
                <Button size="sm" className="gradient-primary text-primary-foreground border-0">
                  <Plus className="h-4 w-4 mr-2" />
                  Add material
                </Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-md overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Register raw material</SheetTitle>
                </SheetHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>SKU</Label>
                    <SkuPicker
                      registry="production"
                      purpose="component"
                      inOverlay
                      value={sku}
                      onValueChange={setSku}
                      onSkuSelect={(row) => {
                        if (row) {
                          setProductId(row.product_id ?? row.id);
                          setSku(row.sku);
                          setName(row.name);
                          setCostPrice(String(row.cost_price ?? ""));
                        }
                      }}
                      placeholder="Search or enter SKU…"
                    />
                  </div>
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Material name"
                      disabled={!!productId}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Reorder level</Label>
                      <Input
                        type="number"
                        min={0}
                        value={reorderPoint}
                        onChange={(e) => setReorderPoint(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Unit cost</Label>
                      <Input
                        type="number"
                        min={0}
                        step="0.0001"
                        value={costPrice}
                        onChange={(e) => setCostPrice(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  {!productId && (
                    <div>
                      <Label>Opening qty (new SKU only)</Label>
                      <Input
                        type="number"
                        min={0}
                        step="0.001"
                        value={openingQty}
                        onChange={(e) => setOpeningQty(e.target.value)}
                      />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label>Preferred supplier</Label>
                    <SupplierSelect value={supplierId} onValueChange={setSupplierId} />
                  </div>
                </div>
                <SheetFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={submitMaterial} disabled={register.isPending}>
                    Save
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          ) : null
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applySearch()}
              placeholder="Search SKU or name…"
            />
          </div>
          <Button variant="secondary" onClick={applySearch}>
            Search
          </Button>
          <Select
            value={scope}
            onValueChange={(v) => {
              setScope(v as "all" | "bom");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tracked</SelectItem>
              <SelectItem value="bom">Used in BOM</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={lowOnly ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setLowOnly((v) => !v);
              setPage(1);
            }}
          >
            Low stock only
          </Button>
        </CardContent>
      </Card>

      {isError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Failed to load raw materials. Log out and back in if permissions were recently added.
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-sm text-muted-foreground">Loading materials…</div>
          ) : materials.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Layers}
                title="No raw materials"
                description="Register SKUs with track inventory enabled, or add lines to a BOM."
              />
            </div>
          ) : (
            <>
              {isFetching && !isLoading && (
                <p className="px-4 py-2 text-xs text-muted-foreground">Refreshing…</p>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Reorder</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs">{r.sku}</TableCell>
                      <TableCell className="font-medium">
                        {r.name}
                        {r.in_bom && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            BOM ×{r.bom_usage_count}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {r.preferred_supplier_name ?? "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>
                            {r.stock} {r.uom}
                          </span>
                          <Progress value={r.fill_percent} className="h-1.5 w-20" />
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{r.reorder_point}</TableCell>
                      <TableCell>{formatMoney(r.cost_price)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={stockTone(r.status)}>
                          {stockLabel(r.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {canManage && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setProductId(r.product_id);
                                  setSku(r.sku);
                                  setName(r.name);
                                  setReorderPoint(String(r.reorder_point));
                                  setCostPrice(String(r.cost_price));
                                  setSupplierId(
                                    r.preferred_supplier_id ? String(r.preferred_supplier_id) : "",
                                  );
                                  setOpen(true);
                                }}
                              >
                                Edit
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem asChild>
                              <Link to="/app/inv/purchase-orders">Create PO</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to="/app/prod/bom">View BOMs</Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {pagination && pagination.lastPage > 1 && (
                <div className="border-t p-3">
                  <PaginationBar
                    page={pagination.page}
                    lastPage={pagination.lastPage}
                    total={pagination.total}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
