import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormSheet } from "@/shared/components/forms/form-sheet";
import { SearchableSelect } from "@/shared/components/forms/searchable-select";
import { createZodResolver } from "@/shared/components/forms/zod-form";
import { contactFormSchema, type ContactFormValues } from "@/modules/crm/schemas";
import { useCreateContact, useCrmCustomers, useUpdateContact } from "@/hooks/crm/use-crm";
import { customerSelectOptions } from "@/modules/crm/utils/select-options";
import type { CrmContactDto } from "@/modules/crm/types";

const defaults: ContactFormValues = {
  first_name: "",
  last_name: "",
  job_title: "",
  customer_id: "",
  company_name: "",
  email: "",
  phone: "",
  tags: "",
  notes: "",
};

function parseTags(raw?: string): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 10);
}

function toFormValues(contact?: CrmContactDto | null): ContactFormValues {
  if (!contact) return defaults;
  return {
    first_name: contact.first_name,
    last_name: contact.last_name ?? "",
    job_title: contact.job_title ?? "",
    customer_id: contact.customer_id ? String(contact.customer_id) : "",
    company_name: contact.company_name ?? "",
    email: contact.email ?? "",
    phone: contact.phone ?? "",
    tags: (contact.tags ?? []).join(", "),
    notes: contact.notes ?? "",
  };
}

function toPayload(values: ContactFormValues) {
  return {
    first_name: values.first_name,
    last_name: values.last_name || undefined,
    job_title: values.job_title || undefined,
    customer_id: values.customer_id ? Number(values.customer_id) : undefined,
    company_name: values.company_name || undefined,
    email: values.email || undefined,
    phone: values.phone || undefined,
    tags: parseTags(values.tags),
    notes: values.notes || undefined,
  };
}

type ContactFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: CrmContactDto | null;
};

export function ContactFormSheet({ open, onOpenChange, contact }: ContactFormSheetProps) {
  const isEdit = Boolean(contact?.id);
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const { data: customersData } = useCrmCustomers({ per_page: 200 });
  const customers = customersData?.data ?? [];

  const form = useForm<ContactFormValues>({
    resolver: createZodResolver(contactFormSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (open) {
      form.reset(toFormValues(contact));
    }
  }, [open, contact, form]);

  const onSubmit = async (values: ContactFormValues) => {
    const payload = toPayload(values);
    if (isEdit && contact) {
      await updateContact.mutateAsync({ id: contact.id, body: payload });
    } else {
      await createContact.mutateAsync(payload);
    }
    form.reset(defaults);
    onOpenChange(false);
  };

  const loading = createContact.isPending || updateContact.isPending;

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Contact" : "New Contact"}
      form={form}
      onSubmit={onSubmit}
      submitLabel={isEdit ? "Save Changes" : "Create Contact"}
      loading={loading}
    >
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="First name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Last name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="job_title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Job title</FormLabel>
            <FormControl>
              <Input {...field} placeholder="e.g. VP Procurement" />
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
            <FormLabel>Linked customer</FormLabel>
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
        name="company_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company (if no customer)</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Company name" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="tags"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tags</FormLabel>
            <FormControl>
              <Input {...field} placeholder="decision-maker, champion" />
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
