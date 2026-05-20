import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FormSheet } from "@/shared/components/forms/form-sheet";
import { createZodResolver } from "@/shared/components/forms/zod-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkuPicker } from "@/shared/components/forms/sku-picker";
import { useGenerateSku } from "@/hooks/inventory/use-skus";
import { Wand2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategorySelectField } from "@/modules/inventory/components/category-select-field";
import { productFormSchema, type ProductFormValues } from "@/modules/inventory/schemas";
import { useCreateProduct, useUpdateProduct } from "@/hooks/inventory/use-inventory-products";
import type { ProductDto, ProductStatus } from "@/modules/inventory/types";
import { useInventoryCategories } from "@/hooks/inventory/use-inventory-categories";
import { useInventoryWarehouses } from "@/hooks/inventory/use-inventory-warehouses";

type ProductFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  product?: ProductDto | null;
};

const defaultValues: ProductFormValues = {
  name: "",
  sku: "",
  categoryId: "",
  brand: "",
  stock: 0,
  warehouseId: "",
  purchasePrice: 0,
  price: 0,
  status: "active",
  barcode: "",
  description: "",
};

export function ProductFormSheet({ open, onOpenChange, mode, product }: ProductFormSheetProps) {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const generateSku = useGenerateSku();
  const { data: categories = [] } = useInventoryCategories();
  const { data: warehousesData } = useInventoryWarehouses();
  const warehouses = warehousesData?.data ?? [];
  const defaultWarehouseId = String(
    warehouses.find((w) => w.is_default)?.id ?? warehouses[0]?.id ?? "",
  );

  const form = useForm<ProductFormValues>({
    resolver: createZodResolver(productFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && product) {
      form.reset({
        name: product.name,
        sku: product.sku,
        categoryId: String(product.category_id ?? product.category_ref?.id ?? ""),
        brand: product.brand ?? "",
        stock: product.stock,
        warehouseId: String(product.default_warehouse_id ?? defaultWarehouseId),
        purchasePrice: Number(product.cost_price ?? 0),
        price: Number(product.price ?? 0),
        status: (product.status as ProductFormValues["status"]) || "active",
        barcode: product.barcode ?? "",
        description: product.description ?? "",
      });
    } else {
      form.reset({ ...defaultValues, warehouseId: defaultWarehouseId });
    }
  }, [open, mode, product, form, defaultWarehouseId]);

  const onSubmit = async (values: ProductFormValues) => {
    const selectedCategory = categories.find((c) => String(c.id) === values.categoryId);
    const apiStatus: ProductStatus =
      values.status === "draft" ? "inactive" : values.status === "low-stock" ? "active" : (values.status as ProductStatus);

    const body = {
      sku: values.sku?.trim() || undefined,
      name: values.name.trim(),
      category_id: values.categoryId ? Number(values.categoryId) : undefined,
      category: selectedCategory?.name,
      brand: values.brand?.trim() || "N/A",
      price: Number(values.price) || 0,
      cost_price: Number(values.purchasePrice) || 0,
      barcode: values.barcode?.trim() || undefined,
      description: values.description?.trim() || undefined,
      status: apiStatus,
      ...(values.warehouseId ? { default_warehouse_id: Number(values.warehouseId) } : {}),
      ...(mode === "create" && Number(values.stock) > 0 ? { opening_qty: Number(values.stock) } : {}),
    };

    if (mode === "create") {
      await createProduct.mutateAsync(body);
    } else if (product) {
      await updateProduct.mutateAsync({ id: product.id, body });
    }
    onOpenChange(false);
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "create" ? "Create product" : "Edit product"}
      form={form}
      onSubmit={onSubmit}
      submitLabel={mode === "create" ? "Create product" : "Save changes"}
      loading={createProduct.isPending || updateProduct.isPending}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Product name</FormLabel>
              <FormControl>
                <Input placeholder="Product name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <SkuPicker
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Search or type SKU…"
                    disabled={mode === "edit"}
                    className="flex-1"
                  />
                </FormControl>
                {mode === "create" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    title="Generate SKU"
                    disabled={generateSku.isPending}
                    onClick={async () => {
                      const cat = categories.find((c) => String(c.id) === form.getValues("categoryId"));
                      const prefix = cat?.code?.slice(0, 4) || "SKU";
                      const result = await generateSku.mutateAsync({ category_prefix: prefix });
                      field.onChange(result.sku);
                    }}
                  >
                    <Wand2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="barcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Barcode</FormLabel>
              <FormControl>
                <Input placeholder="EAN / UPC" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <CategorySelectField value={field.value ?? ""} onChange={field.onChange} required />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="brand"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="purchasePrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cost price</FormLabel>
              <FormControl>
                <Input type="number" min={0} step="0.01" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Selling price</FormLabel>
              <FormControl>
                <Input type="number" min={0} step="0.01" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        {mode === "create" ? (
          <>
            <FormField
              control={form.control}
              name="warehouseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warehouse</FormLabel>
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select warehouse" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {warehouses.map((w) => (
                        <SelectItem key={w.id} value={String(w.id)}>
                          {w.name} ({w.code})
                          {w.is_default ? " · Default" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Opening stock is posted to this warehouse.
                  </p>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opening stock</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ) : (
          <FormField
            control={form.control}
            name="warehouseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default warehouse</FormLabel>
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select warehouse" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {warehouses.map((w) => (
                      <SelectItem key={w.id} value={String(w.id)}>
                        {w.name} ({w.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </FormSheet>
  );
}
