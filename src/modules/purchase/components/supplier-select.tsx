import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSuppliers } from "@/hooks/purchase/use-purchase";

type SupplierSelectProps = {
  value?: string;
  onValueChange: (supplierId: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  activeOnly?: boolean;
};

export function SupplierSelect({
  value,
  onValueChange,
  placeholder = "Select supplier…",
  disabled,
  className,
  activeOnly = true,
}: SupplierSelectProps) {
  const { data, isLoading } = useSuppliers({ per_page: 200, status: activeOnly ? "active" : undefined });
  const suppliers = data?.data ?? [];

  return (
    <Select value={value ?? ""} onValueChange={onValueChange} disabled={disabled || isLoading}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={isLoading ? "Loading…" : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {suppliers.map((s) => (
          <SelectItem key={s.id} value={String(s.id)}>
            {s.name}
            {s.code ? ` (${s.code})` : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
