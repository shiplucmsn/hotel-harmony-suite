import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormSheet } from "@/shared/components/forms/form-sheet";
import { SearchableSelect } from "@/shared/components/forms/searchable-select";
import { createZodResolver } from "@/shared/components/forms/zod-form";
import { invoiceFormSchema, type InvoiceFormValues } from "@/modules/crm/schemas";
import { useCreateInvoice, useCrmCustomers, useCrmOrders } from "@/hooks/crm/use-crm";
import { customerSelectOptions, orderSelectOptions } from "@/modules/crm/utils/select-options";

const defaults: InvoiceFormValues = {
  customer_id: "",
  crm_order_id: "",
  tax_amount: 0,
  due: "",
};

type InvoiceFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCustomerId?: string;
  defaultOrderId?: string;
  /** When false, skips auto-fulfill on issue (use for already-fulfilled orders). */
  autoFulfill?: boolean;
};

export function InvoiceFormSheet({
  open,
  onOpenChange,
  defaultCustomerId,
  defaultOrderId,
  autoFulfill = true,
}: InvoiceFormSheetProps) {
  const createInvoice = useCreateInvoice();
  const { data: customersData } = useCrmCustomers({ per_page: 200 });
  const { data: ordersData } = useCrmOrders({ per_page: 200 });
  const customers = customersData?.data ?? [];
  const orders = (ordersData?.data ?? []).filter((o) => o.status !== "cancelled");

  const form = useForm<InvoiceFormValues>({
    resolver: createZodResolver(invoiceFormSchema),
    defaultValues: defaults,
  });

  const customerId = form.watch("customer_id");

  useEffect(() => {
    if (!open) return;
    form.reset({
      ...defaults,
      customer_id: defaultCustomerId ?? "",
      crm_order_id: defaultOrderId ?? "",
      due: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
    });
  }, [open, defaultCustomerId, defaultOrderId, form]);

  const onSubmit = async (values: InvoiceFormValues) => {
    await createInvoice.mutateAsync({
      customer_id: Number(values.customer_id),
      crm_order_id:
        values.crm_order_id && values.crm_order_id !== "none" ? Number(values.crm_order_id) : undefined,
      auto_fulfill: autoFulfill,
      tax_amount: values.tax_amount,
      due: values.due || undefined,
    });
    onOpenChange(false);
  };

  const customerOrders = orders.filter((o) => String(o.customer_id) === customerId);

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Issue Invoice"
      form={form}
      onSubmit={onSubmit}
      submitLabel="Issue Invoice"
      loading={createInvoice.isPending}
    >
      <FormField
        control={form.control}
        name="customer_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Customer</FormLabel>
            <FormControl>
              <SearchableSelect
                value={field.value}
                onValueChange={field.onChange}
                options={customerSelectOptions(customers)}
                placeholder="Select customer"
                searchPlaceholder="Search customers…"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="crm_order_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sales order (optional)</FormLabel>
            <FormControl>
              <SearchableSelect
                value={field.value ?? ""}
                onValueChange={field.onChange}
                options={orderSelectOptions(customerOrders, { label: "— None —" })}
                placeholder="From order lines"
                searchPlaceholder="Search orders…"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-3">
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
        <FormField
          control={form.control}
          name="due"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due date</FormLabel>
              <FormControl>
                <Input {...field} type="date" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Issuing posts AR/revenue journals and updates the customer ledger.
        {autoFulfill
          ? " Unfulfilled linked orders will auto-fulfill inventory."
          : " Stock was already fulfilled for this order."}
      </p>
    </FormSheet>
  );
}
