import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { JournalStatus } from "@/modules/finance/types";

const styles: Record<JournalStatus, string> = {
  posted: "bg-success/15 text-success border-success/20",
  reversed: "bg-muted text-muted-foreground border-border",
  draft: "bg-warning/15 text-warning border-warning/20",
};

const labels: Record<JournalStatus, string> = {
  posted: "Posted",
  reversed: "Reversed",
  draft: "Draft",
};

export function JournalStatusBadge({ status }: { status: JournalStatus }) {
  return (
    <Badge variant="outline" className={cn(styles[status] ?? styles.draft)}>
      {labels[status] ?? status}
    </Badge>
  );
}
