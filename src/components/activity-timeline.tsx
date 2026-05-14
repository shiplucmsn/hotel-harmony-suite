import { CheckCircle2, Plus, Edit3, Trash2, Settings2 } from "lucide-react";
import { recentActivity } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const iconMap = {
  approve: { icon: CheckCircle2, cls: "bg-success/10 text-success" },
  create: { icon: Plus, cls: "bg-primary/10 text-primary" },
  update: { icon: Edit3, cls: "bg-info/10 text-info" },
  delete: { icon: Trash2, cls: "bg-destructive/10 text-destructive" },
  system: { icon: Settings2, cls: "bg-muted text-muted-foreground" },
};

export function ActivityTimeline({ items = recentActivity }: { items?: typeof recentActivity }) {
  return (
    <div className="relative space-y-4">
      <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />
      {items.map((a) => {
        const m = iconMap[a.type as keyof typeof iconMap] ?? iconMap.system;
        const Icon = m.icon;
        return (
          <div key={a.id} className="relative flex gap-3 pl-0">
            <div className={cn("relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-background", m.cls)}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 pb-2">
              <p className="text-sm">
                <span className="font-medium">{a.user}</span>{" "}
                <span className="text-muted-foreground">{a.action}</span>{" "}
                <span className="font-medium">{a.target}</span>
              </p>
              <p className="text-xs text-muted-foreground">{a.time}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
