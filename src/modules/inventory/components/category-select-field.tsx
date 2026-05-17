import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryCreateDialog } from "@/modules/inventory/components/category-create-dialog";
import { useInventoryCategories } from "@/hooks/inventory/use-inventory-categories";

type CategorySelectFieldProps = {
  label?: string;
  value: string;
  onChange: (categoryId: string) => void;
  required?: boolean;
  placeholder?: string;
};

export function CategorySelectField({
  label = "Category",
  value,
  onChange,
  required,
  placeholder = "Select category",
}: CategorySelectFieldProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const { data: categories = [], isLoading } = useInventoryCategories();

  const selectValue = value && categories.some((c) => String(c.id) === value) ? value : undefined;

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-2">
        <Label>
          {label}
          {required ? " *" : null}
        </Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          New category
        </Button>
      </div>

      <Select value={selectValue} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger>
          <SelectValue placeholder={isLoading ? "Loading categories…" : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {categories.length === 0 ? (
            <SelectItem value="__none" disabled>
              No categories yet — create one
            </SelectItem>
          ) : (
            categories.map((cat) => (
              <SelectItem key={cat.id} value={String(cat.id)}>
                {cat.name} ({cat.code})
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      <CategoryCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(cat) => onChange(String(cat.id))}
      />
    </div>
  );
}
