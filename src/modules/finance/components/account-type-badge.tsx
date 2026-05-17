import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AccountType } from "@/modules/finance/types";
import { formatAccountType } from "@/modules/finance/utils";

const styles: Record<AccountType, string> = {
  asset: "bg-info/15 text-info border-info/20",
  liability: "bg-warning/15 text-warning border-warning/20",
  equity: "bg-primary/15 text-primary border-primary/20",
  revenue: "bg-success/15 text-success border-success/20",
  expense: "bg-destructive/15 text-destructive border-destructive/20",
};

export function AccountTypeBadge({ type, className }: { type: AccountType; className?: string }) {
  return (
    <Badge variant="outline" className={cn(styles[type], className)}>
      {formatAccountType(type)}
    </Badge>
  );
}
