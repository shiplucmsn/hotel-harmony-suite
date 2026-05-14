import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { activities } from "@/lib/pm-mock";

export const Route = createFileRoute("/app/pm/timeline")({ component: TimelinePage });

const fullActivities = [
  ...activities,
  { id: "x1", who: "Lena Vogt", what: "uploaded file", target: "design-spec-v3.fig", to: "", when: "3d ago" },
  { id: "x2", who: "Tomas Reiner", what: "merged PR for", target: "REST adapter v2", to: "merged", when: "3d ago" },
  { id: "x3", who: "Anna Beck", what: "filed bug on", target: "Login flow", to: "P1", when: "4d ago" },
  { id: "x4", who: "Erik Lund", what: "approved budget for", target: "Helix ERP Migration", to: "$320k", when: "5d ago" },
];

function TimelinePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Timeline"
        description="Every change across projects, in chronological order."
        breadcrumbs={[{ label: "Projects" }, { label: "Timeline" }]}
      />

      <Card>
        <CardHeader><CardTitle>Activity feed</CardTitle></CardHeader>
        <CardContent>
          <div className="relative pl-6">
            <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
            <div className="space-y-5">
              {fullActivities.map(a => (
                <div key={a.id} className="relative">
                  <div className="absolute -left-4 top-1.5 h-3 w-3 rounded-full gradient-primary ring-4 ring-background" />
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full gradient-primary text-primary-foreground grid place-items-center text-xs font-semibold shrink-0">{a.who.split(" ").map(s=>s[0]).join("")}</div>
                    <div className="flex-1">
                      <div className="text-sm"><span className="font-medium">{a.who}</span> {a.what} <span className="font-medium">{a.target}</span> {a.to && <Badge variant="outline" className="ml-1 text-[10px]">{a.to}</Badge>}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{a.when}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
