import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  active: "bg-success/15 text-success border-success/20",
  "low-stock": "bg-warning/15 text-warning border-warning/20",
  "out-of-stock": "bg-destructive/15 text-destructive border-destructive/20",
  inactive: "bg-muted text-muted-foreground border-border",
  discontinued: "bg-muted text-muted-foreground border-border",
  draft: "bg-muted text-muted-foreground border-border",
};

type ProductStatusBadgeProps = {
  status: string;
  className?: string;
};

export function ProductStatusBadge({ status, className }: ProductStatusBadgeProps) {
  const label =
    status === "low-stock"
      ? "Low stock"
      : status === "out-of-stock"
        ? "Out of stock"
        : status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, " ");

  return (
    <Badge variant="outline" className={cn(tones[status] ?? tones.active, className)}>
      {label}
    </Badge>
  );
}
