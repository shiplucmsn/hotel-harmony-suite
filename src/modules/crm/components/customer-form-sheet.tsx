import { useForm } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormSheet } from "@/shared/components/forms/form-sheet";
import { createZodResolver } from "@/shared/components/forms/zod-form";
import { customerFormSchema, type CustomerFormValues } from "@/modules/crm/schemas";
import { useCreateCustomer } from "@/hooks/crm/use-crm";

const defaults: CustomerFormValues = {
  code: "",
  name: "",
  email: "",
  phone: "",
  address: "",
};

type CustomerFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CustomerFormSheet({ open, onOpenChange }: CustomerFormSheetProps) {
  const createCustomer = useCreateCustomer();
  const form = useForm<CustomerFormValues>({
    resolver: createZodResolver(customerFormSchema),
    defaultValues: defaults,
  });

  const onSubmit = async (values: CustomerFormValues) => {
    await createCustomer.mutateAsync({
      code: values.code || undefined,
      name: values.name,
      email: values.email || undefined,
      phone: values.phone || undefined,
      address: values.address || undefined,
    });
    form.reset(defaults);
    onOpenChange(false);
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="New Customer"
      form={form}
      onSubmit={onSubmit}
      submitLabel="Save Customer"
      loading={createCustomer.isPending}
    >
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="col-span-2 sm:col-span-1">
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Acme Inc." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem className="col-span-2 sm:col-span-1">
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Input {...field} placeholder="CUST-001" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
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
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Textarea {...field} rows={2} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSheet>
  );
}
