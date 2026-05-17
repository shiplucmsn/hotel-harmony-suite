import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FormSheet } from "@/shared/components/forms/form-sheet";
import { createZodResolver } from "@/shared/components/forms/zod-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { accountFormSchema, type AccountFormValues } from "@/modules/finance/schemas";
import { useCreateFinanceAccount } from "@/hooks/finance/use-finance-accounts";

const ACCOUNT_TYPES = ["asset", "liability", "equity", "revenue", "expense"] as const;

type AccountFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AccountFormSheet({ open, onOpenChange }: AccountFormSheetProps) {
  const createAccount = useCreateFinanceAccount();

  const form = useForm<AccountFormValues>({
    resolver: createZodResolver(accountFormSchema),
    defaultValues: {
      code: "",
      name: "",
      type: "expense",
      description: "",
      is_postable: true,
    },
  });

  useEffect(() => {
    if (!open) form.reset();
  }, [open, form]);

  const onSubmit = async (values: AccountFormValues) => {
    await createAccount.mutateAsync(values);
    onOpenChange(false);
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Create account"
      form={form}
      onSubmit={onSubmit}
      submitLabel="Create account"
      loading={createAccount.isPending}
    >
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Input placeholder="6400" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ACCOUNT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input placeholder="Travel Expense" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea rows={2} placeholder="Optional notes…" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="is_postable"
        render={({ field }) => (
          <FormItem className="flex items-center gap-2 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <FormLabel className="!mt-0 font-normal">Allow journal postings to this account</FormLabel>
          </FormItem>
        )}
      />
    </FormSheet>
  );
}
