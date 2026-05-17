import { forwardRef, useImperativeHandle, useRef } from "react";
import { ScanBarcode } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type BarcodeScannerInputRef = {
  focus: () => void;
  select: () => void;
};

type BarcodeScannerInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  className?: string;
  large?: boolean;
};

export const BarcodeScannerInput = forwardRef<BarcodeScannerInputRef, BarcodeScannerInputProps>(
  function BarcodeScannerInput({ value, onChange, onSubmit, disabled, className, large }, ref) {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      select: () => inputRef.current?.select(),
    }));

    return (
      <div className={cn("relative", className)}>
        <ScanBarcode className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
        <Input
          ref={inputRef}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSubmit();
            }
          }}
          placeholder="Scan barcode or type SKU…"
          className={cn("pl-10 font-mono", large && "h-12 text-lg")}
          autoComplete="off"
          inputMode="numeric"
        />
      </div>
    );
  },
);
