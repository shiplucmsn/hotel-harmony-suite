import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { createZodResolver } from "@/shared/components/forms/zod-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { journalFormSchema, type JournalFormValues } from "@/modules/finance/schemas";
import { formatMoney, journalLineTotals } from "@/modules/finance/utils";
import { usePostJournalEntry } from "@/hooks/finance/use-journal-entries";
import type { FinanceAccountDto } from "@/modules/finance/types";

type JournalEntrySheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: FinanceAccountDto[];
};

const defaultLine = { account_code: "", debit: 0, credit: 0 };

export function JournalEntrySheet({ open, onOpenChange, accounts }: JournalEntrySheetProps) {
  const postJournal = usePostJournalEntry();
  const postable = accounts.filter((a) => a.is_postable && a.is_active);

  const form = useForm<JournalFormValues>({
    resolver: createZodResolver(journalFormSchema),
    defaultValues: {
      entry_date: new Date().toISOString().slice(0, 10),
      reference_type: "manual",
      reference_id: "",
      memo: "",
      lines: [{ ...defaultLine }, { ...defaultLine }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "lines" });
  const lines = form.watch("lines");
  const totals = journalLineTotals(lines ?? []);

  useEffect(() => {
    if (!open) form.reset();
  }, [open, form]);

  const onSubmit = async (values: JournalFormValues) => {
    await postJournal.mutateAsync(values);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>New journal entry</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 flex flex-1 flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="entry_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reference_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference ID</FormLabel>
                    <FormControl>
                      <Input placeholder="JE-2025-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="reference_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference type</FormLabel>
                  <FormControl>
                    <Input placeholder="manual" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="memo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Memo</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="Description…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right w-28">Debit</TableHead>
                    <TableHead className="text-right w-28">Credit</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`lines.${index}.account_code`}
                          render={({ field: f }) => (
                            <Select value={f.value} onValueChange={f.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select account" />
                              </SelectTrigger>
                              <SelectContent>
                                {postable.map((a) => (
                                  <SelectItem key={a.code} value={a.code}>
                                    {a.code} — {a.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`lines.${index}.debit`}
                          render={({ field: f }) => (
                            <Input type="number" step="0.01" min={0} className="text-right" {...f} />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`lines.${index}.credit`}
                          render={({ field: f }) => (
                            <Input type="number" step="0.01" min={0} className="text-right" {...f} />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={fields.length <= 2}
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {form.formState.errors.lines?.message ? (
              <p className="text-sm text-destructive">{String(form.formState.errors.lines.message)}</p>
            ) : null}

            <Button type="button" variant="outline" size="sm" onClick={() => append({ ...defaultLine })}>
              <Plus className="mr-2 h-4 w-4" />
              Add line
            </Button>

            <div className="flex justify-end gap-6 text-sm tabular-nums">
              <span>
                Debit: <strong>{formatMoney(totals.debit)}</strong>
              </span>
              <span>
                Credit: <strong>{formatMoney(totals.credit)}</strong>
              </span>
              {!totals.balanced ? (
                <span className="text-destructive">Out of balance</span>
              ) : (
                <span className="text-success">Balanced</span>
              )}
            </div>

            <SheetFooter className="mt-auto gap-2 sm:justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={postJournal.isPending} className="gradient-primary border-0 text-primary-foreground">
                Post entry
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
