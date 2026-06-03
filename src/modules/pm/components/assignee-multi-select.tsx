import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { HrEmployeeDto } from "@/modules/hr/types";

type Props = {
  employees: HrEmployeeDto[];
  value: number[];
  onChange: (ids: number[]) => void;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
};

function EmployeeOption({
  employee,
  checked,
  onToggle,
}: {
  employee: HrEmployeeDto;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <CommandItem
      value={`${employee.name} ${employee.employee_no}`}
      onSelect={onToggle}
    >
      <Checkbox checked={checked} className="mr-2" aria-hidden />
      <div className="flex flex-col min-w-0">
        <span className="truncate">{employee.name}</span>
        <span className="text-xs text-muted-foreground truncate">
          {employee.employee_no}
          {employee.department_name || employee.department
            ? ` · ${employee.department_name ?? employee.department}`
            : ""}
        </span>
      </div>
      <Check className={cn("ml-auto h-4 w-4", checked ? "opacity-100" : "opacity-0")} />
    </CommandItem>
  );
}

export function AssigneeMultiSelect({
  employees,
  value,
  onChange,
  disabled,
  loading,
  placeholder = "Select employees",
}: Props) {
  const [open, setOpen] = useState(false);

  const { selectedEmployees, otherEmployees } = useMemo(() => {
    const selectedSet = new Set(value);
    const byName = (a: HrEmployeeDto, b: HrEmployeeDto) => a.name.localeCompare(b.name);

    return {
      selectedEmployees: employees.filter((e) => selectedSet.has(e.id)).sort(byName),
      otherEmployees: employees.filter((e) => !selectedSet.has(e.id)).sort(byName),
    };
  }, [employees, value]);

  const selectedCount = selectedEmployees.length;

  const toggle = (id: number) => {
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          disabled={disabled || loading}
        >
          <span className="flex items-center gap-2 truncate text-muted-foreground">
            <Users className="h-4 w-4 shrink-0" />
            {loading
              ? "Loading employees…"
              : selectedCount > 0
                ? `${selectedCount} selected`
                : placeholder}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search employee…" />
          <CommandList>
            <CommandEmpty>No active employees found.</CommandEmpty>
            {selectedEmployees.length > 0 && (
              <CommandGroup heading="Selected">
                {selectedEmployees.map((employee) => (
                  <EmployeeOption
                    key={employee.id}
                    employee={employee}
                    checked
                    onToggle={() => toggle(employee.id)}
                  />
                ))}
              </CommandGroup>
            )}
            {selectedEmployees.length > 0 && otherEmployees.length > 0 && <CommandSeparator />}
            {otherEmployees.length > 0 && (
              <CommandGroup heading={selectedEmployees.length > 0 ? "Others" : undefined}>
                {otherEmployees.map((employee) => (
                  <EmployeeOption
                    key={employee.id}
                    employee={employee}
                    checked={false}
                    onToggle={() => toggle(employee.id)}
                  />
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
