import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateInventoryCategory } from "@/hooks/inventory/use-inventory-categories";
import type { InventoryCategoryDto } from "@/modules/inventory/types";

function slugCode(name: string): string {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 40);
}

type CategoryCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (category: InventoryCategoryDto) => void;
  parentOptions?: InventoryCategoryDto[];
  defaultParentId?: number | null;
};

export function CategoryCreateDialog({
  open,
  onOpenChange,
  onCreated,
  parentOptions = [],
  defaultParentId = null,
}: CategoryCreateDialogProps) {
  const createCategory = useCreateInventoryCategory();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState<string>("");

  useEffect(() => {
    if (!open) {
      setName("");
      setCode("");
      setDescription("");
      setParentId(defaultParentId ? String(defaultParentId) : "");
    }
  }, [open, defaultParentId]);

  useEffect(() => {
    if (name.trim() && !code.trim()) {
      setCode(slugCode(name));
    }
  }, [name, code]);

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const category = await createCategory.mutateAsync({
      name: trimmedName,
      code: (code.trim() || slugCode(trimmedName)).toUpperCase(),
      description: description.trim() || undefined,
      parent_id: parentId ? Number(parentId) : undefined,
    });

    onCreated?.(category);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create category</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="cat-name">Name *</Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Housekeeping"
            />
          </div>
          {parentOptions.length > 0 ? (
            <div className="grid gap-2">
              <Label>Parent category</Label>
              <Select value={parentId || "__none"} onValueChange={(v) => setParentId(v === "__none" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="None (top level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">None (top level)</SelectItem>
                  {parentOptions.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name} ({p.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          <div className="grid gap-2">
            <Label htmlFor="cat-code">Code *</Label>
            <Input
              id="cat-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="HOUSEKEEPING"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cat-desc">Description</Label>
            <Textarea
              id="cat-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={createCategory.isPending || !name.trim()}
          >
            {createCategory.isPending ? "Saving…" : "Create category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
