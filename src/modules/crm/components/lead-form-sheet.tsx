import { useForm } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormSheet } from "@/shared/components/forms/form-sheet";
import { createZodResolver } from "@/shared/components/forms/zod-form";
import { leadFormSchema, type LeadFormValues } from "@/modules/crm/schemas";
import { useCreateLead } from "@/hooks/crm/use-crm";

const defaults: LeadFormValues = {
  name: "",
  email: "",
  phone: "",
  company_name: "",
  source: "",
  notes: "",
};

type LeadFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LeadFormSheet({ open, onOpenChange }: LeadFormSheetProps) {
  const createLead = useCreateLead();
  const form = useForm<LeadFormValues>({
    resolver: createZodResolver(leadFormSchema),
    defaultValues: defaults,
  });

  const onSubmit = async (values: LeadFormValues) => {
    await createLead.mutateAsync({
      name: values.name,
      email: values.email || undefined,
      phone: values.phone || undefined,
      company_name: values.company_name || undefined,
      source: values.source || undefined,
      notes: values.notes || undefined,
    });
    form.reset(defaults);
    onOpenChange(false);
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="New Lead"
      form={form}
      onSubmit={onSubmit}
      submitLabel="Create Lead"
      loading={createLead.isPending}
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Contact name" />
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
            <FormLabel>Company</FormLabel>
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
                <Input {...field} type="email" />
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
        name="source"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Source</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Website, referral…" />
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
