import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormSheet } from "@/shared/components/forms/form-sheet";
import { createZodResolver } from "@/shared/components/forms/zod-form";
import { orderFormSchema, type OrderFormValues } from "@/modules/crm/schemas";
import { useCreateOrder, useCrmCustomers } from "@/hooks/crm/use-crm";
import { useInventoryProducts } from "@/hooks/inventory/use-inventory-products";
import { formatMoney } from "@/modules/crm/utils";

const defaults: OrderFormValues = {
  customer_id: "",
  tax_amount: 0,
  lines: [{ sku: "", quantity: 1, unit_price: 0, unit_cost: 0 }],
};

type OrderFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function OrderFormSheet({ open, onOpenChange }: OrderFormSheetProps) {
  const createOrder = useCreateOrder();
  const { data: customersData } = useCrmCustomers({ per_page: 200 });
  const { data: productsData } = useInventoryProducts({ per_page: 200 });
  const customers = customersData?.data ?? [];
  const products = productsData?.data ?? [];

  const form = useForm<OrderFormValues>({
    resolver: createZodResolver(orderFormSchema),
    defaultValues: defaults,
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "lines" });

  useEffect(() => {
    if (!open) form.reset(defaults);
  }, [open, form]);

  const lines = form.watch("lines");
  const subtotal = lines.reduce((s, l) => s + (Number(l.quantity) || 0) * (Number(l.unit_price) || 0), 0);
  const tax = Number(form.watch("tax_amount")) || 0;

  const onSubmit = async (values: OrderFormValues) => {
    await createOrder.mutateAsync({
      customer_id: Number(values.customer_id),
      tax_amount: values.tax_amount,
      lines: values.lines.map((l) => ({
        sku: l.sku,
        quantity: l.quantity,
        unit_price: l.unit_price,
        unit_cost: l.unit_cost,
      })),
    });
    onOpenChange(false);
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="New Sales Order"
      form={form}
      onSubmit={onSubmit}
      submitLabel="Create Order"
      loading={createOrder.isPending}
    >
      <FormField
        control={form.control}
        name="customer_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Customer</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <FormLabel>Line items</FormLabel>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ sku: "", quantity: 1, unit_price: 0, unit_cost: 0 })}
          >
            <Plus className="mr-1 h-3 w-3" /> Add line
          </Button>
        </div>
        {fields.map((field, index) => (
          <div key={field.id} className="grid gap-2 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Line {index + 1}</span>
              {fields.length > 1 && (
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove(index)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            <FormField
              control={form.control}
              name={`lines.${index}.sku`}
              render={({ field: f }) => (
                <FormItem>
                  <FormLabel>Product SKU</FormLabel>
                  <Select
                    value={f.value}
                    onValueChange={(sku) => {
                      f.onChange(sku);
                      const product = products.find((p) => p.sku === sku);
                      if (product) {
                        form.setValue(`lines.${index}.unit_price`, Number(product.price ?? 0));
                        form.setValue(`lines.${index}.unit_cost`, Number(product.cost_price ?? 0));
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select SKU" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.sku}>
                          {p.sku} — {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-3 gap-2">
              <FormField
                control={form.control}
                name={`lines.${index}.quantity`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel>Qty</FormLabel>
                    <FormControl>
                      <Input {...f} type="number" min={0} step="any" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`lines.${index}.unit_price`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input {...f} type="number" min={0} step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`lines.${index}.unit_cost`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel>Cost</FormLabel>
                    <FormControl>
                      <Input {...f} type="number" min={0} step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        ))}
      </div>

      <FormField
        control={form.control}
        name="tax_amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tax</FormLabel>
            <FormControl>
              <Input {...field} type="number" min={0} step="0.01" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="rounded-lg bg-muted/50 p-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatMoney(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax</span>
          <span>{formatMoney(tax)}</span>
        </div>
        <div className="mt-1 flex justify-between border-t pt-2 font-semibold">
          <span>Total</span>
          <span>{formatMoney(subtotal + tax)}</span>
        </div>
      </div>
    </FormSheet>
  );
}
