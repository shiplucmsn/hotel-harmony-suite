import type { ReactNode } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type FormSheetProps<T extends FieldValues> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  form: UseFormReturn<T>;
  onSubmit: (values: T) => void | Promise<void>;
  children: ReactNode;
  submitLabel?: string;
  loading?: boolean;
};

export function FormSheet<T extends FieldValues>({
  open,
  onOpenChange,
  title,
  form,
  onSubmit,
  children,
  submitLabel = "Save",
  loading,
}: FormSheetProps<T>) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-4 overflow-y-auto py-4">
            {children}
            <SheetFooter className="mt-auto gap-2 sm:justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : null}
                {loading ? "Saving…" : submitLabel}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
