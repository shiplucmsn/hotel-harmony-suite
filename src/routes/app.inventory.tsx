import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BranchContextChip } from "@/components/branch-context-chip";
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
import { Search, Boxes, Plus, Pencil, MoreHorizontal, Save } from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-errors";
import { showSideEffects } from "@/lib/api-meta";
import { CategorySelectField } from "@/modules/inventory/components/category-select-field";
import { inventoryApi } from "@/modules/inventory/inventory-api";
import { useInventoryCategories } from "@/hooks/inventory/use-inventory-categories";
import { apiStatusFromDisplay, mapProductToRow, type StockDisplayStatus } from "@/modules/inventory/utils";

export const Route = createFileRoute("/app/inventory")({ component: InventoryPage });

type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  category: string;
  categoryId: string;
  warehouse: string;
  stock: number;
  reorderLevel: number;
  unitCost: number;
  sellingPrice: number;
  status: StockDisplayStatus;
};

type InventoryForm = {
  name: string;
  sku: string;
  categoryId: string;
  warehouse: string;
  stock: string;
  reorderLevel: string;
  unitCost: string;
  sellingPrice: string;
  status: InventoryItem["status"];
};

const statusTone: Record<InventoryItem["status"], string> = {
  "in-stock": "bg-success/15 text-success border-success/20",
  "low-stock": "bg-warning/15 text-warning border-warning/20",
  "out-of-stock": "bg-destructive/15 text-destructive border-destructive/20",
};

function InventoryPage() {
  const { data: categories = [] } = useInventoryCategories();
  const [query, setQuery] = useState("");
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [form, setForm] = useState<InventoryForm>({
    name: "",
    sku: "",
    categoryId: "",
    warehouse: "Main Store",
    stock: "0",
    reorderLevel: "10",
    unitCost: "0",
    sellingPrice: "0",
    status: "in-stock",
  });

  const loadInventory = async () => {
    try {
      setLoadError(null);
      const { data } = await inventoryApi.items();
      setInventoryList(data.map((p) => mapProductToRow(p, 10)));
    } catch (err) {
      setInventoryList([]);
      const message = getApiErrorMessage(err, "Failed to load inventory");
      setLoadError(message);
      toast.error(message);
    }
  };

  useEffect(() => {
    void loadInventory();
  }, []);

  const filteredItems = inventoryList.filter((item) => {
    const text = `${item.sku} ${item.name} ${item.category}`.toLowerCase();
    return text.includes(query.toLowerCase());
  });

  const openCreateSheet = () => {
    setSheetMode("create");
    setSelectedItem(null);
    setForm({
      name: "",
      sku: "",
      categoryId: "",
      warehouse: "Main Store",
      stock: "0",
      reorderLevel: "10",
      unitCost: "0",
      sellingPrice: "0",
      status: "in-stock",
    });
    setFormKey((prev) => prev + 1);
    setSheetOpen(true);
  };

  const openEditSheet = (item: InventoryItem) => {
    setSheetMode("edit");
    setSelectedItem(item);
    setForm({
      name: item.name,
      sku: item.sku,
      categoryId: item.categoryId,
      warehouse: item.warehouse,
      stock: String(item.stock),
      reorderLevel: String(item.reorderLevel),
      unitCost: String(item.unitCost),
      sellingPrice: String(item.sellingPrice),
      status: item.status,
    });
    setFormKey((prev) => prev + 1);
    setSheetOpen(true);
  };

  const saveInventoryItem = async () => {
    const openingQty = Number(form.stock) || 0;
    const selectedCategory = categories.find((c) => String(c.id) === form.categoryId);
    const payload = {
      name: form.name.trim() || "Untitled Item",
      sku: form.sku.trim() || undefined,
      category_id: form.categoryId ? Number(form.categoryId) : undefined,
      category: selectedCategory?.name,
      brand: "N/A",
      price: Number(form.sellingPrice) || 0,
      cost_price: Number(form.unitCost) || 0,
      status: apiStatusFromDisplay(form.status),
      ...(sheetMode === "create" && openingQty > 0 ? { opening_qty: openingQty } : {}),
    };

    try {
      if (sheetMode === "create") {
        const res = await inventoryApi.createProduct(payload);
        showSideEffects(res.meta);
        toast.success("Inventory item created");
      } else if (selectedItem) {
        const res = await inventoryApi.updateProduct(selectedItem.id, payload);
        showSideEffects(res.meta);
        toast.success("Inventory item updated");
      }
      await loadInventory();
      setSheetOpen(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not save inventory item"));
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Inventory"
        description="Track stock levels across warehouses and manage items."
        breadcrumbs={[{ label: "Operations" }, { label: "Inventory" }]}
        actions={
          <>
          <BranchContextChip />
          <Button
            className="gradient-primary text-primary-foreground border-0"
            onClick={() => {
              openCreateSheet();
              toast.success("Create inventory form opened");
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Item
          </Button>
          </>
        }
      />

      {loadError ? (
        <Card className="border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{loadError}</Card>
      ) : null}

      <Card className="p-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by SKU, name or category..."
            className="pl-9"
          />
        </div>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="space-y-3 p-3 md:hidden">
            {filteredItems.map((item) => (
              <div key={item.id} className="rounded-lg border p-3">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.sku} - {item.category}
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
                          openEditSheet(item);
                          toast.message(`${item.sku} edit form opened`);
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
                    <span className="text-muted-foreground">Warehouse:</span> {item.warehouse}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Stock:</span> {item.stock}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Reorder:</span> {item.reorderLevel}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <Badge variant="outline" className={statusTone[item.status]}>
                      {item.status}
                    </Badge>
                    <span className="font-semibold">৳{item.sellingPrice.toLocaleString()}</span>
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
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Reorder</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Sell Price</TableHead>
                  <TableHead className="w-10">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.sku}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.warehouse}</TableCell>
                    <TableCell className="text-right">{item.stock}</TableCell>
                    <TableCell className="text-right">{item.reorderLevel}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusTone[item.status]}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">৳{item.sellingPrice.toLocaleString()}</TableCell>
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
                              openEditSheet(item);
                              toast.message(`${item.sku} edit form opened`);
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
              <Boxes className="h-4 w-4" />
              {sheetMode === "create" ? "Create Inventory Item" : "Edit Inventory Item"}
            </SheetTitle>
          </SheetHeader>

          <div key={formKey} className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Item Name *</Label>
                <Input placeholder="e.g. Premium Bed Sheet" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>SKU *</Label>
                <Input placeholder="e.g. RM-101" value={form.sku} onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))} />
              </div>
              <CategorySelectField
                value={form.categoryId}
                onChange={(categoryId) => setForm((p) => ({ ...p, categoryId }))}
                required
              />
              <div className="grid gap-2">
                <Label>Warehouse *</Label>
                <Select value={form.warehouse} onValueChange={(value) => setForm((p) => ({ ...p, warehouse: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Main Store">Main Store</SelectItem>
                    <SelectItem value="Kitchen Store">Kitchen Store</SelectItem>
                    <SelectItem value="Amenities Store">Amenities Store</SelectItem>
                    <SelectItem value="Backup Store">Backup Store</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-lg border p-3">
              <p className="mb-3 text-sm font-semibold">Stock & Pricing</p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="grid gap-2">
                  <Label>Current Stock *</Label>
                  <Input type="number" min={0} value={form.stock} onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Reorder Level *</Label>
                  <Input type="number" min={0} value={form.reorderLevel} onChange={(e) => setForm((p) => ({ ...p, reorderLevel: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Unit Cost *</Label>
                  <Input type="number" min={0} value={form.unitCost} onChange={(e) => setForm((p) => ({ ...p, unitCost: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Selling Price *</Label>
                  <Input type="number" min={0} value={form.sellingPrice} onChange={(e) => setForm((p) => ({ ...p, sellingPrice: e.target.value }))} />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Status *</Label>
                <Select value={form.status} onValueChange={(value: InventoryItem["status"]) => setForm((p) => ({ ...p, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                    <SelectItem value="low-stock">Low Stock</SelectItem>
                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Supplier</Label>
                <Input placeholder="e.g. ABC Supplies Ltd." />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label>Notes</Label>
                <Textarea rows={5} placeholder="Item notes, storage instructions, purchase remarks..." />
              </div>
            </div>
          </div>

          <SheetFooter className="mt-6 flex-col-reverse gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>
              Cancel
            </Button>
            <Button
              className="gradient-primary text-primary-foreground border-0"
              onClick={saveInventoryItem}
            >
              {sheetMode === "create" ? <Save className="mr-2 h-4 w-4" /> : <Pencil className="mr-2 h-4 w-4" />}
              {sheetMode === "create" ? "Create Item" : "Update Item"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
