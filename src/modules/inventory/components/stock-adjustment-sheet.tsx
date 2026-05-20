import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FormSheet } from "@/shared/components/forms/form-sheet";
import { createZodResolver } from "@/shared/components/forms/zod-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SkuPicker } from "@/shared/components/forms/sku-picker";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { stockAdjustmentSchema, type StockAdjustmentFormValues } from "@/modules/inventory/schemas";
import { useAdjustStock } from "@/hooks/inventory/use-stock-movements";
import { useInventoryWarehouses } from "@/hooks/inventory/use-inventory-warehouses";

type StockAdjustmentSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSku?: string;
};

export function StockAdjustmentSheet({ open, onOpenChange, defaultSku }: StockAdjustmentSheetProps) {
  const adjustStock = useAdjustStock();
  const { data: warehousesData } = useInventoryWarehouses();
  const warehouses = warehousesData?.data ?? [];

  const form = useForm<StockAdjustmentFormValues>({
    resolver: createZodResolver(stockAdjustmentSchema),
    defaultValues: { sku: "", warehouseId: "", quantity: 0, unitCost: 0, notes: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        sku: defaultSku ?? "",
        warehouseId: warehouses.find((w) => w.is_default)?.id ? String(warehouses.find((w) => w.is_default)!.id) : "",
        quantity: 0,
        unitCost: 0,
        notes: "",
      });
    }
  }, [open, defaultSku, form, warehouses]);

  const onSubmit = async (values: StockAdjustmentFormValues) => {
    await adjustStock.mutateAsync({
      sku: values.sku,
      warehouse_id: values.warehouseId ? Number(values.warehouseId) : undefined,
      quantity: Number(values.quantity),
      unit_cost: Number(values.unitCost) || 0,
      notes: values.notes,
      reference_type: "inventory_adjustment",
    });
    onOpenChange(false);
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Stock adjustment"
      form={form}
      onSubmit={onSubmit}
      submitLabel="Post adjustment"
      loading={adjustStock.isPending}
    >
      <FormField
        control={form.control}
        name="sku"
        render={({ field }) => (
          <FormItem>
            <FormLabel>SKU</FormLabel>
            <FormControl>
              <SkuPicker value={field.value} onValueChange={field.onChange} placeholder="Search or type SKU…" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="warehouseId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Warehouse</FormLabel>
            <Select value={field.value || "__none"} onValueChange={(v) => field.onChange(v === "__none" ? "" : v)}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Default warehouse" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="__none">Default warehouse</SelectItem>
                {warehouses.map((w) => (
                  <SelectItem key={w.id} value={String(w.id)}>
                    {w.name} ({w.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="quantity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Quantity (+ in / − out)</FormLabel>
            <FormControl>
              <Input type="number" step="0.001" placeholder="e.g. 10 or -5" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="unitCost"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Unit cost</FormLabel>
            <FormControl>
              <Input type="number" min={0} step="0.01" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea rows={3} placeholder="Reason for adjustment" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </FormSheet>
  );
}
