import { cn } from "@/lib/utils";

type BarcodeStripProps = {
  value: string;
  className?: string;
  height?: number;
};

/** Decorative EAN-style bars for barcode-ready UI (not a real encoding). */
export function BarcodeStrip({ value, className, height = 64 }: BarcodeStripProps) {
  const seed = value.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const bars = Array.from({ length: 42 }, (_, i) => {
    const w = (seed + i * 7) % 4 === 0 ? 3 : (seed + i) % 2 === 0 ? 2 : 1;
    const h = 45 + ((seed + i * 11) % 55);
    return { w, h };
  });

  return (
    <div className={cn("rounded-md border bg-white p-3", className)}>
      <div className="flex items-end justify-center gap-px" style={{ height }}>
        {bars.map((bar, i) => (
          <div key={i} className="bg-black" style={{ width: bar.w, height: `${bar.h}%` }} />
        ))}
      </div>
      <p className="mt-2 text-center font-mono text-xs tracking-[0.2em] text-black">{value || "—"}</p>
    </div>
  );
}
