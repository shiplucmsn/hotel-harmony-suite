import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FormSheet } from "@/shared/components/forms/form-sheet";
import { createZodResolver } from "@/shared/components/forms/zod-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { warehouseFormSchema, type WarehouseFormValues } from "@/modules/inventory/schemas";
import { useCreateWarehouse } from "@/hooks/inventory/use-inventory-warehouses";
import { useTenantContext } from "@/hooks/use-tenant-context";

type WarehouseFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function WarehouseFormSheet({ open, onOpenChange }: WarehouseFormSheetProps) {
  const createWarehouse = useCreateWarehouse();
  const { data: tenantCtx } = useTenantContext();
  const branches = tenantCtx?.branches ?? [];

  const form = useForm<WarehouseFormValues>({
    resolver: createZodResolver(warehouseFormSchema),
    defaultValues: {
      code: "",
      name: "",
      location: "",
      status: "active",
      is_default: false,
      branch_id: tenantCtx?.active_branch_id ?? undefined,
    },
  });

  useEffect(() => {
    if (!open) form.reset();
  }, [open, form]);

  const onSubmit = async (values: WarehouseFormValues) => {
    await createWarehouse.mutateAsync({
      code: values.code.toUpperCase(),
      name: values.name,
      location: values.location,
      status: values.status,
      is_default: values.is_default,
      branch_id: values.branch_id,
    });
    onOpenChange(false);
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Create warehouse"
      form={form}
      onSubmit={onSubmit}
      submitLabel="Create warehouse"
      loading={createWarehouse.isPending}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Input placeholder="MAIN" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Main warehouse" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="City, address" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
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
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        {branches.length > 0 ? (
          <FormField
            control={form.control}
            name="branch_id"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Branch</FormLabel>
                <Select
                  value={field.value ? String(field.value) : undefined}
                  onValueChange={(v) => field.onChange(Number(v))}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={String(b.id)}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}
        <FormField
          control={form.control}
          name="is_default"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0 pt-6">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="font-normal">Default warehouse</FormLabel>
            </FormItem>
          )}
        />
      </div>
    </FormSheet>
  );
}
