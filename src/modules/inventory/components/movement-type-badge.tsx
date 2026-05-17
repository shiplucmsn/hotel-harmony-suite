import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { movementTypeLabel } from "@/modules/inventory/utils";

type MovementTypeBadgeProps = {
  type: string;
  delta?: number;
};

export function MovementTypeBadge({ type, delta }: MovementTypeBadgeProps) {
  const isOut = delta !== undefined ? delta < 0 : type.includes("out") || type === "out";
  return (
    <Badge
      variant="outline"
      className={cn(
        isOut ? "border-destructive/20 bg-destructive/10 text-destructive" : "border-success/20 bg-success/10 text-success",
      )}
    >
      {movementTypeLabel(type)}
    </Badge>
  );
}
