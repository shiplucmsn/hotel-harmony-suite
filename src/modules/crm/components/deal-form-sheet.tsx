import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormSheet } from "@/shared/components/forms/form-sheet";
import { SearchableSelect } from "@/shared/components/forms/searchable-select";
import { createZodResolver } from "@/shared/components/forms/zod-form";
import { DEAL_STAGES, dealFormSchema, type DealFormValues } from "@/modules/crm/schemas";
import { useCreateDeal, useCrmCustomers, useUpdateDeal } from "@/hooks/crm/use-crm";
import { customerSelectOptions, staticSelectOptions } from "@/modules/crm/utils/select-options";
import type { CrmDealDto } from "@/modules/crm/types";

const defaults: DealFormValues = {
  title: "",
  customer_id: "",
  prospect_name: "",
  stage: "lead",
  value: 0,
  probability: 15,
  owner_name: "",
  expected_close_date: "",
  notes: "",
};

function toFormValues(deal?: CrmDealDto | null, stage?: DealFormValues["stage"]): DealFormValues {
  if (!deal) {
    return { ...defaults, stage: stage ?? "lead" };
  }
  return {
    title: deal.title,
    customer_id: deal.customer_id ? String(deal.customer_id) : "",
    prospect_name: deal.prospect_name ?? "",
    stage: deal.stage,
    value: deal.value,
    probability: deal.probability,
    owner_name: deal.owner_name ?? deal.owner ?? "",
    expected_close_date: deal.expected_close_date ?? "",
    notes: deal.notes ?? "",
  };
}

function toPayload(values: DealFormValues) {
  return {
    title: values.title,
    customer_id: values.customer_id ? Number(values.customer_id) : undefined,
    prospect_name: values.prospect_name || undefined,
    stage: values.stage,
    value: values.value,
    probability: values.probability,
    owner_name: values.owner_name || undefined,
    expected_close_date: values.expected_close_date || undefined,
    notes: values.notes || undefined,
  };
}

type DealFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal?: CrmDealDto | null;
  defaultStage?: DealFormValues["stage"];
};

export function DealFormSheet({ open, onOpenChange, deal, defaultStage }: DealFormSheetProps) {
  const isEdit = Boolean(deal?.id);
  const createDeal = useCreateDeal();
  const updateDeal = useUpdateDeal();
  const { data: customersData } = useCrmCustomers({ per_page: 200 });
  const customers = customersData?.data ?? [];

  const form = useForm<DealFormValues>({
    resolver: createZodResolver(dealFormSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (open) {
      form.reset(toFormValues(deal, defaultStage));
    }
  }, [open, deal, defaultStage, form]);

  const onSubmit = async (values: DealFormValues) => {
    const payload = toPayload(values);
    if (isEdit && deal) {
      await updateDeal.mutateAsync({ id: deal.id, body: payload });
    } else {
      await createDeal.mutateAsync(payload);
    }
    form.reset(defaults);
    onOpenChange(false);
  };

  const loading = createDeal.isPending || updateDeal.isPending;

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Deal" : "New Deal"}
      form={form}
      onSubmit={onSubmit}
      submitLabel={isEdit ? "Save Changes" : "Create Deal"}
      loading={loading}
    >
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Deal title</FormLabel>
            <FormControl>
              <Input {...field} placeholder="e.g. ERP Renewal" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="customer_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Customer</FormLabel>
            <FormControl>
              <SearchableSelect
                value={field.value || "none"}
                onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                options={customerSelectOptions(customers, { label: "No customer" })}
                placeholder="Optional"
                searchPlaceholder="Search customers…"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="prospect_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Prospect (if no customer)</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Company or contact name" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Value</FormLabel>
              <FormControl>
                <Input type="number" min={0} step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="probability"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Probability %</FormLabel>
              <FormControl>
                <Input type="number" min={0} max={100} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="stage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stage</FormLabel>
              <FormControl>
                <SearchableSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  options={staticSelectOptions(DEAL_STAGES)}
                  searchPlaceholder="Search stage…"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="expected_close_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expected close</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="owner_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Owner</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Sales rep name" />
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
              <Textarea {...field} rows={3} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSheet>
  );
}
