import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { SearchableSelect } from "@/shared/components/forms/searchable-select";
import { staticSelectOptions } from "@/modules/crm/utils/select-options";

type CrmFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  status?: string;
  onStatusChange?: (value: string) => void;
  statusOptions?: { value: string; label: string }[];
};

export function CrmFilters({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  status,
  onStatusChange,
  statusOptions,
}: CrmFiltersProps) {
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
          <SearchableSelect
            value={status ?? "all"}
            onValueChange={onStatusChange}
            options={staticSelectOptions(statusOptions)}
            placeholder="Status"
            searchPlaceholder="Search status…"
            className="w-36"
          />
        ) : null}
      </div>
    </Card>
  );
}
