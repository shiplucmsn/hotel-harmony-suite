import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, Package, Plus, Pencil, MoreHorizontal, Save } from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-errors";
import { showSideEffects } from "@/lib/api-meta";
import { CategorySelectField } from "@/modules/inventory/components/category-select-field";
import { inventoryApi } from "@/modules/inventory/inventory-api";
import { useInventoryCategories } from "@/hooks/inventory/use-inventory-categories";
import type { ProductStatus } from "@/modules/inventory/types";

export const Route = createFileRoute("/app/products")({ component: ProductsPage });

type ProductItem = {
  id: string;
  sku: string;
  name: string;
  category: string;
  categoryId: string;
  brand: string;
  stock: number;
  price: number;
  status: ProductStatus | "low-stock";
};

type ProductFormState = {
  sku: string;
  name: string;
  categoryId: string;
  brand: string;
  stock: string;
  reorderLevel: string;
  purchasePrice: string;
  price: string;
  status: ProductItem["status"];
  barcode: string;
  description: string;
};

const statusTone: Record<ProductItem["status"], string> = {
  active: "bg-success/15 text-success border-success/20",
  "low-stock": "bg-warning/15 text-warning border-warning/20",
  draft: "bg-muted text-muted-foreground border-border",
};

const emptyProductForm: ProductFormState = {
  sku: "",
  name: "",
  categoryId: "",
  brand: "",
  stock: "0",
  reorderLevel: "10",
  purchasePrice: "0",
  price: "0",
  status: "active",
  barcode: "",
  description: "",
};

function ProductsPage() {
  const { data: categories = [] } = useInventoryCategories();
  const [query, setQuery] = useState("");
  const [productList, setProductList] = useState<ProductItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [form, setForm] = useState<ProductFormState>(emptyProductForm);

  const mapProduct = (item: Record<string, unknown>): ProductItem => ({
    id: String(item.id ?? ""),
    sku: String(item.sku ?? ""),
    name: String(item.name ?? ""),
    category: String(item.category ?? "Uncategorized"),
    categoryId: String(item.categoryId ?? item.category_id ?? ""),
    brand: String(item.brand ?? "N/A"),
    stock: Number(item.stock ?? 0),
    price: Number(item.price ?? 0),
    status: (String(item.status ?? "active") as ProductItem["status"]) || "active",
  });

  const loadProducts = async () => {
    try {
      setLoadError(null);
      const { data } = await inventoryApi.products({ per_page: 100 });
      setProductList(
        data.map((p) =>
          mapProduct({
            id: p.id,
            sku: p.sku,
            name: p.name,
            category: p.category_ref?.name ?? p.category,
            categoryId: p.category_id ?? p.category_ref?.id,
            brand: p.brand,
            stock: p.stock,
            price: p.price,
            status: p.status,
          })
        )
      );
    } catch (err) {
      setLoadError(getApiErrorMessage(err, "Failed to load products"));
      setProductList([]);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  const filteredProducts = productList.filter((product) => {
    const text = `${product.sku} ${product.name} ${product.category} ${product.brand}`.toLowerCase();
    return text.includes(query.toLowerCase());
  });

  const openCreateSheet = () => {
    setSheetMode("create");
    setSelectedProduct(null);
    setForm(emptyProductForm);
    setFormKey((prev) => prev + 1);
    setSheetOpen(true);
  };

  const openEditSheet = (product: ProductItem) => {
    setSheetMode("edit");
    setSelectedProduct(product);
    setForm({
      sku: product.sku,
      name: product.name,
      categoryId: product.categoryId,
      brand: product.brand,
      stock: String(product.stock),
      reorderLevel: "10",
      purchasePrice: String(Math.floor(product.price * 0.75)),
      price: String(product.price),
      status: product.status,
      barcode: "",
      description: "",
    });
    setFormKey((prev) => prev + 1);
    setSheetOpen(true);
  };

  const saveProduct = async () => {
    const fallbackName = form.name.trim() || "Untitled Product";
    const fallbackSku = form.sku.trim() || `PRD-${String(Date.now()).slice(-5)}`;

    const stockQty = Number(form.stock) || 0;
    const apiStatus: ProductStatus =
      form.status === "draft" ? "inactive" : form.status === "low-stock" ? "active" : (form.status as ProductStatus);

    const selectedCategory = categories.find((c) => String(c.id) === form.categoryId);
    const payload = {
      sku: fallbackSku,
      name: fallbackName,
      category_id: form.categoryId ? Number(form.categoryId) : undefined,
      category: selectedCategory?.name,
      brand: form.brand.trim() || "N/A",
      price: Number(form.price) || 0,
      cost_price: Number(form.purchasePrice) || 0,
      barcode: form.barcode.trim() || undefined,
      description: form.description.trim() || undefined,
      status: apiStatus,
      ...(sheetMode === "create" && stockQty > 0 ? { opening_qty: stockQty } : {}),
    };

    try {
      if (sheetMode === "create") {
        const res = await inventoryApi.createProduct(payload);
        showSideEffects(res.meta);
        toast.success("Product created");
      } else if (selectedProduct) {
        const res = await inventoryApi.updateProduct(selectedProduct.id, payload);
        showSideEffects(res.meta);
        toast.success("Product updated");
      }
      await loadProducts();
      setSheetOpen(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not save product"));
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Products"
        description="Manage your product catalog, pricing and stock."
        breadcrumbs={[{ label: "Operations" }, { label: "Products" }]}
        actions={
          <Button
            className="gradient-primary text-primary-foreground border-0"
            onClick={() => {
              openCreateSheet();
              toast.success("Create product form opened");
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Product
          </Button>
        }
      />

      <Card className="p-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by SKU, name, brand..."
            className="pl-9"
          />
        </div>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="space-y-3 p-3 md:hidden">
            {filteredProducts.map((product) => (
              <div key={product.id} className="rounded-lg border p-3">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.sku} - {product.brand}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          openEditSheet(product);
                          toast.message(`${product.sku} edit form opened`);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Category:</span> {product.category}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Stock:</span> {product.stock}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <Badge variant="outline" className={statusTone[product.status]}>
                      {product.status}
                    </Badge>
                    <span className="font-semibold">৳{product.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-lg border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="w-10">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.sku}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.brand}</TableCell>
                    <TableCell className="text-right">{product.stock}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusTone[product.status]}>
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">৳{product.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              openEditSheet(product);
                              toast.message(`${product.sku} edit form opened`);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-4xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              {sheetMode === "create" ? "Create Product" : "Edit Product"}
            </SheetTitle>
          </SheetHeader>

          <div key={formKey} className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Product Name *</Label>
                <Input placeholder="e.g. Premium Bed Sheet Set" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>SKU *</Label>
                <Input placeholder="e.g. PRD-101" value={form.sku} onChange={(e) => setForm((prev) => ({ ...prev, sku: e.target.value }))} />
              </div>
              <CategorySelectField
                value={form.categoryId}
                onChange={(categoryId) => setForm((prev) => ({ ...prev, categoryId }))}
                required
              />
              <div className="grid gap-2">
                <Label>Brand</Label>
                <Input placeholder="e.g. Harmony" value={form.brand} onChange={(e) => setForm((prev) => ({ ...prev, brand: e.target.value }))} />
              </div>
            </div>

            <div className="rounded-lg border p-3">
              <p className="mb-3 text-sm font-semibold">Inventory & Pricing</p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="grid gap-2">
                  <Label>Current Stock *</Label>
                  <Input type="number" min={0} value={form.stock} onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Reorder Level *</Label>
                  <Input type="number" min={0} value={form.reorderLevel} onChange={(e) => setForm((prev) => ({ ...prev, reorderLevel: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Purchase Price *</Label>
                  <Input type="number" min={0} value={form.purchasePrice} onChange={(e) => setForm((prev) => ({ ...prev, purchasePrice: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Selling Price *</Label>
                  <Input type="number" min={0} value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Status *</Label>
                <Select value={form.status} onValueChange={(value: ProductItem["status"]) => setForm((prev) => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="low-stock">Low Stock</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Barcode</Label>
                <Input placeholder="e.g. 8901234567890" value={form.barcode} onChange={(e) => setForm((prev) => ({ ...prev, barcode: e.target.value }))} />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea rows={5} placeholder="Short product details, usage and notes..." value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
              </div>
            </div>
          </div>

          <SheetFooter className="mt-6 flex-col-reverse gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>
              Cancel
            </Button>
            <Button
              className="gradient-primary text-primary-foreground border-0"
              onClick={saveProduct}
            >
              {sheetMode === "create" ? <Save className="mr-2 h-4 w-4" /> : <Pencil className="mr-2 h-4 w-4" />}
              {sheetMode === "create" ? "Create Product" : "Update Product"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
