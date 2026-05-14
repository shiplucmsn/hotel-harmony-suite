import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/stat-card";
import { projects, tasks, pmTone } from "@/lib/pm-mock";
import { CalendarClock, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

export const Route = createFileRoute("/app/pm/deadlines")({ component: DeadlinesPage });

function daysTo(date: string) {
  const diff = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff;
}

function DeadlinesPage() {
  const upcoming = [
    ...projects.map(p => ({ kind: "Project", title: p.name, sub: p.client, due: p.due, status: p.status })),
    ...tasks.map(t => ({ kind: "Task", title: t.title, sub: t.project, due: t.due, status: t.status })),
  ].sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());

  const overdue = upcoming.filter(u => daysTo(u.due) < 0).length;
  const thisWeek = upcoming.filter(u => daysTo(u.due) >= 0 && daysTo(u.due) <= 7).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deadline Tracking"
        description="Stay ahead of upcoming due dates and overdue items."
        breadcrumbs={[{ label: "Projects" }, { label: "Deadlines" }]}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Overdue" value={String(overdue)} change="+1" trend="down" icon={AlertTriangle} />
        <StatCard label="This week" value={String(thisWeek)} icon={CalendarClock} />
        <StatCard label="On track" value="18" icon={CheckCircle2} />
        <StatCard label="Avg lead" value="6d" icon={Clock} />
      </div>

      <Card>
        <CardHeader><CardTitle>Upcoming deadlines</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {upcoming.slice(0, 12).map((u, i) => {
              const d = daysTo(u.due);
              const tone = d < 0 ? "bg-destructive/10 border-destructive/30 text-destructive" : d <= 3 ? "bg-warning/10 border-warning/30 text-warning" : "bg-muted border-border text-muted-foreground";
              return (
                <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className={`rounded-lg border px-3 py-2 text-center ${tone}`}>
                    <div className="text-lg font-bold leading-none">{Math.abs(d)}</div>
                    <div className="text-[10px] uppercase">{d < 0 ? "overdue" : "days"}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{u.title}</div>
                    <div className="text-xs text-muted-foreground">{u.kind} · {u.sub}</div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-xs text-muted-foreground">{u.due}</div>
                    <Badge variant="outline" className={pmTone(u.status)}>{u.status.replace("_"," ")}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
