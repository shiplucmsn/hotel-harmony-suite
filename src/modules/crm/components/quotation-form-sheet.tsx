import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Loader2, Mail, Plus, Trash2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/shared/components/forms/searchable-select";
import { SkuPicker } from "@/shared/components/forms/sku-picker";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { createZodResolver } from "@/shared/components/forms/zod-form";
import { quotationFormSchema, type QuotationFormValues } from "@/modules/crm/schemas";
import { useCreateQuotation, useCrmCustomers, useUpdateQuotation } from "@/hooks/crm/use-crm";
import { formatMoney } from "@/modules/crm/utils";
import { customerSelectOptions } from "@/modules/crm/utils/select-options";
import type { CrmQuotationDto, CrmQuotationLineDto } from "@/modules/crm/types";
import { cn } from "@/lib/utils";

const today = () => new Date().toISOString().slice(0, 10);
const in30Days = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
};

const defaults: QuotationFormValues = {
  customer_id: "",
  number: "",
  quote_date: today(),
  valid_until: in30Days(),
  tax_amount: 0,
  notes: "",
  lines: [{ sku: "", description: "", quantity: 1, unit_price: 0 }],
};

type SubmitMode = "draft" | "save" | "send";

function normalizeLines(lines?: CrmQuotationDto["lines"]): CrmQuotationLineDto[] {
  if (!lines) return [];
  if (Array.isArray(lines)) return lines;
  return [];
}

function toFormValues(quotation?: CrmQuotationDto | null): QuotationFormValues {
  if (!quotation) return defaults;
  const lines = normalizeLines(quotation.lines);
  return {
    customer_id: quotation.customer_id ? String(quotation.customer_id) : "",
    number: quotation.number ?? "",
    quote_date: quotation.quote_date ?? today(),
    valid_until: quotation.valid_until ?? in30Days(),
    tax_amount: quotation.tax_amount ?? 0,
    notes: quotation.notes ?? "",
    lines:
      lines.length > 0
        ? lines.map((l) => ({
            sku: l.sku ?? "",
            description: l.description,
            quantity: l.quantity,
            unit_price: l.unit_price,
          }))
        : defaults.lines,
  };
}

function toPayload(values: QuotationFormValues, status: string, sendEmail = false) {
  return {
    customer_id: Number(values.customer_id),
    number: values.number || undefined,
    status,
    quote_date: values.quote_date || undefined,
    valid_until: values.valid_until || undefined,
    tax_amount: values.tax_amount,
    notes: values.notes || undefined,
    lines: values.lines.map((l) => ({
      sku: l.sku || undefined,
      description: l.description,
      quantity: l.quantity,
      unit_price: l.unit_price,
    })),
    ...(sendEmail ? { send_email: true as const } : {}),
  };
}

function SubmitSpinner({ active }: { active: boolean }) {
  if (!active) return null;
  return <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />;
}

type QuotationFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotation?: CrmQuotationDto | null;
};

export function QuotationFormSheet({ open, onOpenChange, quotation }: QuotationFormSheetProps) {
  const isEdit = Boolean(quotation?.id);
  const createQuotation = useCreateQuotation();
  const updateQuotation = useUpdateQuotation();
  const { data: customersData } = useCrmCustomers({ per_page: 200 });
  const customers = customersData?.data ?? [];
  const customerOptions = useMemo(
    () =>
      customerSelectOptions(customers).map((o) => {
        const c = customers.find((x) => String(x.id) === o.value);
        if (c?.email) {
          return { ...o, label: `${c.name} (${c.email})` };
        }
        return o;
      }),
    [customers],
  );
  const [submitMode, setSubmitMode] = useState<SubmitMode | null>(null);

  const form = useForm<QuotationFormValues>({
    resolver: createZodResolver(quotationFormSchema),
    defaultValues: defaults,
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "lines" });

  useEffect(() => {
    if (open) {
      form.reset(toFormValues(quotation));
      setSubmitMode(null);
    }
  }, [open, quotation, form]);

  const lines = form.watch("lines");
  const subtotal = lines.reduce(
    (sum, line) => sum + (Number(line.quantity) || 0) * (Number(line.unit_price) || 0),
    0,
  );
  const tax = Number(form.watch("tax_amount")) || 0;
  const loading = createQuotation.isPending || updateQuotation.isPending;
  const isDraftSaving = loading && submitMode === "draft";
  const isSaveUpdating = loading && submitMode === "save";
  const isSendUpdating = loading && submitMode === "send";

  const handleOpenChange = (next: boolean) => {
    if (!next && loading) return;
    onOpenChange(next);
  };

  const submit = async (values: QuotationFormValues, mode: SubmitMode) => {
    setSubmitMode(mode);
    try {
      const status =
        mode === "draft" ? "draft" : mode === "send" ? "sent" : (quotation?.status ?? "draft");
      const sendEmail = isEdit && mode === "send";
      const payload = toPayload(values, status, sendEmail);

      if (isEdit && quotation) {
        await updateQuotation.mutateAsync({ id: quotation.id, body: payload });
      } else {
        await createQuotation.mutateAsync(payload);
      }
      form.reset(defaults);
      onOpenChange(false);
    } finally {
      setSubmitMode(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="flex w-full flex-col overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Quotation" : "New Quotation"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Save changes only, or update and email the quote to the customer."
              : "Add customer, line items, and save as draft or send."}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            className="relative flex flex-1 flex-col gap-4 py-4"
            onSubmit={form.handleSubmit((values) => submit(values, submitMode ?? (isEdit ? "save" : "send")))}
          >
            {loading ? (
              <div
                className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/60 backdrop-blur-[1px]"
                aria-live="polite"
                aria-busy="true"
              >
                <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-3 text-sm font-medium shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  {isSendUpdating
                    ? "Sending quote to customer…"
                    : isDraftSaving
                      ? "Saving draft…"
                      : isSaveUpdating
                        ? "Updating quotation…"
                        : "Saving quotation…"}
                </div>
              </div>
            ) : null}

            <fieldset disabled={loading} className={cn("flex flex-col gap-4", loading && "pointer-events-none opacity-60")}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                          options={customerOptions}
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
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quote #</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Auto-generated if empty" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="quote_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quote date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="valid_until"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valid until</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-3 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">LINE ITEMS</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ sku: "", description: "", quantity: 1, unit_price: 0 })}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Add line
                  </Button>
                </div>
                {fields.map((field, index) => (
                  <div key={field.id} className="space-y-2 rounded-md border p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Line {index + 1}</span>
                      {fields.length > 1 ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      ) : null}
                    </div>
                    <FormField
                      control={form.control}
                      name={`lines.${index}.sku`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>SKU (optional)</FormLabel>
                          <FormControl>
                            <SkuPicker
                              value={f.value}
                              onValueChange={f.onChange}
                              onSkuSelect={(row) => {
                                if (row) {
                                  form.setValue(`lines.${index}.description`, row.name);
                                  form.setValue(`lines.${index}.unit_price`, Number(row.price ?? 0));
                                }
                              }}
                              emptyOption={{ label: "Custom line (no SKU)" }}
                              placeholder="Search or type SKU…"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`lines.${index}.description`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name={`lines.${index}.quantity`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel>Qty</FormLabel>
                            <FormControl>
                              <Input type="number" min={0} step="any" {...f} />
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
                            <FormLabel>Unit price</FormLabel>
                            <FormControl>
                              <Input type="number" min={0} step="0.01" {...f} />
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
                    <FormLabel>Tax amount</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
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
                      <Textarea {...field} rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatMoney(subtotal)}</span>
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
            </fieldset>

            <SheetFooter className="mt-auto flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              {!isEdit ? (
                <Button
                  type="submit"
                  variant="outline"
                  disabled={loading}
                  onClick={() => setSubmitMode("draft")}
                >
                  <SubmitSpinner active={isDraftSaving} />
                  Save draft
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="outline"
                  disabled={loading}
                  onClick={() => setSubmitMode("save")}
                >
                  <SubmitSpinner active={isSaveUpdating} />
                  Save changes
                </Button>
              )}
              <Button
                type="submit"
                className="gradient-primary border-0 text-primary-foreground"
                disabled={loading}
                onClick={() => setSubmitMode("send")}
              >
                <SubmitSpinner active={isSendUpdating} />
                {!isSendUpdating ? <Mail className="mr-2 h-4 w-4" /> : null}
                {isEdit ? "Update & send email" : "Send quote"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
