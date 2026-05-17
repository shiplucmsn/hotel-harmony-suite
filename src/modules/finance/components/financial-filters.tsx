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

type FinancialFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  dateFrom?: string;
  dateTo?: string;
  onDateFromChange?: (value: string) => void;
  onDateToChange?: (value: string) => void;
  status?: string;
  onStatusChange?: (value: string) => void;
  statusOptions?: { value: string; label: string }[];
  type?: string;
  onTypeChange?: (value: string) => void;
  typeOptions?: { value: string; label: string }[];
  accountCode?: string;
  onAccountChange?: (value: string) => void;
  accountOptions?: { value: string; label: string }[];
  children?: React.ReactNode;
};

export function FinancialFilters({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  status,
  onStatusChange,
  statusOptions,
  type,
  onTypeChange,
  typeOptions,
  accountCode,
  onAccountChange,
  accountOptions,
  children,
}: FinancialFiltersProps) {
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

        {onDateFromChange ? (
          <Input type="date" value={dateFrom ?? ""} onChange={(e) => onDateFromChange(e.target.value)} className="w-40" />
        ) : null}
        {onDateToChange ? (
          <Input type="date" value={dateTo ?? ""} onChange={(e) => onDateToChange(e.target.value)} className="w-40" />
        ) : null}

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

        {onTypeChange && typeOptions ? (
          <Select value={type ?? "all"} onValueChange={onTypeChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        {onAccountChange && accountOptions ? (
          <Select value={accountCode ?? "all"} onValueChange={onAccountChange}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Account" />
            </SelectTrigger>
            <SelectContent>
              {accountOptions.map((o) => (
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
