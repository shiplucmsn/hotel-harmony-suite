import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

type TenantFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  optional?: boolean;
};

export function TenantField<T extends FieldValues>({ control, name, optional }: TenantFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Workspace ID {optional ? "(optional)" : ""}</FormLabel>
          <FormControl>
            <Input placeholder="acme" autoComplete="organization" {...field} />
          </FormControl>
          <FormDescription>Your company subdomain, e.g. acme</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
