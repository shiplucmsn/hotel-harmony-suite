import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCreateSupplier, useUpdateSupplier } from "@/hooks/purchase/use-purchase";
import type { SupplierDto } from "@/modules/purchase/types";

const schema = z.object({
  code: z.string().max(60).optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(40).optional(),
  address: z.string().optional(),
  payment_terms: z.string().max(80).optional(),
  status: z.enum(["active", "inactive"]),
});

type FormValues = z.infer<typeof schema>;

type SupplierFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: SupplierDto | null;
};

export function SupplierFormSheet({ open, onOpenChange, supplier }: SupplierFormSheetProps) {
  const isEdit = Boolean(supplier?.id);
  const create = useCreateSupplier();
  const update = useUpdateSupplier();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: "",
      name: "",
      email: "",
      phone: "",
      address: "",
      payment_terms: "",
      status: "active",
    },
  });

  useEffect(() => {
    if (!open) return;
    if (supplier) {
      form.reset({
        code: supplier.code ?? "",
        name: supplier.name,
        email: supplier.email ?? "",
        phone: supplier.phone ?? "",
        address: supplier.address ?? "",
        payment_terms: supplier.payment_terms ?? "",
        status: supplier.status === "inactive" ? "inactive" : "active",
      });
    } else {
      form.reset({
        code: "",
        name: "",
        email: "",
        phone: "",
        address: "",
        payment_terms: "",
        status: "active",
      });
    }
  }, [open, supplier, form]);

  const pending = create.isPending || update.isPending;

  const onSubmit = form.handleSubmit(async (values) => {
    const body = {
      code: values.code || undefined,
      name: values.name,
      email: values.email || undefined,
      phone: values.phone || undefined,
      address: values.address || undefined,
      payment_terms: values.payment_terms || undefined,
      status: values.status,
    };

    if (isEdit && supplier) {
      await update.mutateAsync({ id: supplier.id, body });
    } else {
      await create.mutateAsync(body);
    }
    onOpenChange(false);
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit supplier" : "Add supplier"}</SheetTitle>
        </SheetHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="supplier-name">Company name *</Label>
            <Input id="supplier-name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="supplier-code">Code</Label>
            <Input id="supplier-code" placeholder="Auto from name if empty" {...form.register("code")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="supplier-email">Email</Label>
              <Input id="supplier-email" type="email" {...form.register("email")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="supplier-phone">Phone</Label>
              <Input id="supplier-phone" {...form.register("phone")} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="supplier-address">Address</Label>
            <Input id="supplier-address" {...form.register("address")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="supplier-terms">Payment terms</Label>
            <Input id="supplier-terms" placeholder="Net 30" {...form.register("payment_terms")} />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={form.watch("status")}
              onValueChange={(v) => form.setValue("status", v as "active" | "inactive")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <SheetFooter className="px-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : isEdit ? "Save changes" : "Create supplier"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
