import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormSheet } from "@/shared/components/forms/form-sheet";
import { createZodResolver } from "@/shared/components/forms/zod-form";
import { paymentFormSchema, type PaymentFormValues } from "@/modules/crm/schemas";
import { useCreatePayment, useCrmInvoices } from "@/hooks/crm/use-crm";
import { formatMoney } from "@/modules/crm/utils";

const defaults: PaymentFormValues = {
  invoice_id: "",
  amount: 0,
  payment_date: "",
  method: "bank",
};

type PaymentFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultInvoiceId?: string;
};

export function PaymentFormSheet({ open, onOpenChange, defaultInvoiceId }: PaymentFormSheetProps) {
  const createPayment = useCreatePayment();
  const { data: invoicesData } = useCrmInvoices({ per_page: 200 });
  const openInvoices = (invoicesData?.data ?? []).filter(
    (i) => i.balance_due > 0 && i.status !== "void" && i.status !== "draft",
  );

  const form = useForm<PaymentFormValues>({
    resolver: createZodResolver(paymentFormSchema),
    defaultValues: defaults,
  });

  const invoiceId = form.watch("invoice_id");
  const selected = openInvoices.find((i) => String(i.id) === invoiceId);

  useEffect(() => {
    if (!open) return;
    const inv = openInvoices.find((i) => String(i.id) === defaultInvoiceId);
    form.reset({
      invoice_id: defaultInvoiceId ?? "",
      amount: inv?.balance_due ?? 0,
      payment_date: new Date().toISOString().slice(0, 10),
      method: "bank",
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when sheet opens
  }, [open, defaultInvoiceId]);

  useEffect(() => {
    if (selected) form.setValue("amount", selected.balance_due);
  }, [selected, form]);

  const onSubmit = async (values: PaymentFormValues) => {
    await createPayment.mutateAsync({
      invoice_id: Number(values.invoice_id),
      amount: values.amount,
      payment_date: values.payment_date || undefined,
      method: values.method || undefined,
    });
    onOpenChange(false);
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Record Payment"
      form={form}
      onSubmit={onSubmit}
      submitLabel="Post Payment"
      loading={createPayment.isPending}
    >
      <FormField
        control={form.control}
        name="invoice_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Invoice</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select invoice" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {openInvoices.map((i) => (
                  <SelectItem key={i.id} value={String(i.id)}>
                    {i.number} · {i.customer} · due {formatMoney(i.balance_due)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input {...field} type="number" min={0} step="0.01" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="payment_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input {...field} type="date" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="method"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Method</FormLabel>
            <Select value={field.value ?? "bank"} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="bank">Bank transfer</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSheet>
  );
}
