import { Badge } from "@/components/ui/badge";
import { invoiceStatusTone, leadStatusTone, orderStatusTone } from "@/modules/crm/utils";

type StatusKind = "lead" | "order" | "invoice";

const maps: Record<StatusKind, Record<string, string>> = {
  lead: leadStatusTone,
  order: orderStatusTone,
  invoice: invoiceStatusTone,
};

type CrmStatusBadgeProps = {
  kind: StatusKind;
  status: string;
};

export function CrmStatusBadge({ kind, status }: CrmStatusBadgeProps) {
  const tone = maps[kind][status] ?? "bg-muted text-muted-foreground";
  return (
    <Badge variant="outline" className={tone}>
      {status}
    </Badge>
  );
}
