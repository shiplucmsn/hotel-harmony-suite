import * as React from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { useSkuSearch, type SkuSearchRegistry } from "@/hooks/inventory/use-skus";
import type { SkuDto } from "@/modules/inventory/types";

export type SkuPickerProps = {
  value?: string;
  onValueChange?: (sku: string) => void;
  /** Fired when user picks a registry row (includes price/cost for line forms). */
  onSkuSelect?: (item: SkuDto | null) => void;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  /** Optional first row (e.g. quotation custom line). value="" clears SKU. */
  emptyOption?: { label: string };
  /** inventory = /inventory/skus; production = /production/product-skus (BOM sheets). */
  registry?: SkuSearchRegistry;
  /** component = tracked materials; finished = any active product (production registry). */
  purpose?: "component" | "finished";
  /** Raise z-index when rendered inside Sheet/Dialog so the list appears above the panel. */
  inOverlay?: boolean;
};

export function SkuPicker({
  value = "",
  onValueChange,
  onSkuSelect,
  placeholder = "Type or search SKU…",
  emptyMessage = "No SKU found in registry.",
  disabled,
  className,
  emptyOption,
  registry = "inventory",
  purpose = "finished",
  inOverlay = false,
}: SkuPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState(value);

  React.useEffect(() => {
    setInput((prev) => (prev === value ? prev : value));
  }, [value]);

  const { data, isFetching, isError } = useSkuSearch(input, {
    enabled: open && !disabled,
    registry,
    purpose,
  });
  const items = data?.data ?? [];

  const pick = (sku: string, row: SkuDto | null) => {
    setInput(sku);
    onValueChange?.(sku);
    onSkuSelect?.(row);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={inOverlay}>
      <PopoverAnchor asChild>
        <div className={cn("relative", className)}>
          <Input
            value={input}
            disabled={disabled}
            placeholder={placeholder}
            className="font-mono text-sm pr-8"
            autoComplete="off"
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              const next = e.target.value;
              setInput(next);
              onValueChange?.(next);
              setOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setOpen(true);
              }
            }}
          />
          {isFetching && (
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </PopoverAnchor>
      <PopoverContent
        className={cn(
          "w-[var(--radix-popover-trigger-width)] p-0",
          inOverlay && "z-[200]",
        )}
        align="start"
        side="bottom"
        collisionPadding={12}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false}>
          <CommandList>
            {isError && <CommandEmpty>Could not load SKUs.</CommandEmpty>}
            {!isError && !isFetching && items.length === 0 && !emptyOption && (
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            )}
            <CommandGroup>
              {emptyOption && (
                <CommandItem value="__empty__" onSelect={() => pick("", null)}>
                  <Check className={cn("mr-2 h-4 w-4", value === "" ? "opacity-100" : "opacity-0")} />
                  {emptyOption.label}
                </CommandItem>
              )}
              {items.map((row) => (
                <CommandItem key={row.id} value={row.sku} onSelect={() => pick(row.sku, row)}>
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === row.sku ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-mono text-xs">{row.sku}</div>
                    <div className="truncate text-xs text-muted-foreground">{row.name}</div>
                  </div>
                  {row.stock != null && (
                    <span className="ml-2 shrink-0 text-xs text-muted-foreground">stk {row.stock}</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
