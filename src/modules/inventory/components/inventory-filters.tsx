import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type InventoryFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  status?: string;
  onStatusChange?: (value: string) => void;
  statusOptions?: { value: string; label: string }[];
  warehouseId?: string;
  onWarehouseChange?: (value: string) => void;
  warehouseOptions?: { value: string; label: string }[];
  movementType?: string;
  onMovementTypeChange?: (value: string) => void;
  movementTypeOptions?: { value: string; label: string }[];
  children?: React.ReactNode;
};

export function InventoryFilters({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  status,
  onStatusChange,
  statusOptions,
  warehouseId,
  onWarehouseChange,
  warehouseOptions,
  movementType,
  onMovementTypeChange,
  movementTypeOptions,
  children,
}: InventoryFiltersProps) {
  return (
    <Card className="p-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[12rem] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>

        {onStatusChange && statusOptions ? (
          <Select value={status ?? "all"} onValueChange={onStatusChange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        {onWarehouseChange && warehouseOptions ? (
          <Select value={warehouseId ?? "all"} onValueChange={onWarehouseChange}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Warehouse" />
            </SelectTrigger>
            <SelectContent>
              {warehouseOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        {onMovementTypeChange && movementTypeOptions ? (
          <Select value={movementType ?? "all"} onValueChange={onMovementTypeChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {movementTypeOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        {children}
      </div>
    </Card>
  );
}
