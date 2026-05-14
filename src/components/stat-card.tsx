import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label, value, change, icon: Icon, trend = "up", accent,
}: {
  label: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  trend?: "up" | "down";
  accent?: string;
}) {
  return (
    <Card className="relative overflow-hidden transition-all hover:shadow-elegant hover:-translate-y-0.5">
      <div className={cn("absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 blur-2xl", accent ?? "bg-primary")} />
      <CardContent className="relative p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {change && (
          <div className="mt-3 flex items-center gap-1 text-xs">
            <span className={cn("flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium",
              trend === "up" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
              {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {change}
            </span>
            <span className="text-muted-foreground">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
