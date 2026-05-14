import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Star, Users, TrendingUp, Award, Plus } from "lucide-react";
import { reviews } from "@/lib/hr-mock";

export const Route = createFileRoute("/app/hr/performance")({ component: PerformancePage });

function PerformancePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance reviews"
        description="Quarterly evaluations and goal tracking."
        breadcrumbs={[{ label: "HR" }, { label: "Performance" }]}
        actions={<Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="mr-2 h-4 w-4" />New review cycle</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Reviews completed" value="142" change="+8%" icon={Award} accent="bg-success" />
        <StatCard label="In progress" value="34" icon={Users} accent="bg-warning" />
        <StatCard label="Avg. rating" value="4.4 / 5" change="+0.2" icon={Star} />
        <StatCard label="Top performers" value="22" change="+3" icon={TrendingUp} accent="bg-info" />
      </div>

      <Card>
        <CardHeader><CardTitle>Q1 2026 reviews</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10"><AvatarFallback className="gradient-primary text-primary-foreground text-xs">{r.employee.split(" ").map(w=>w[0]).slice(0,2).join("")}</AvatarFallback></Avatar>
                <div>
                  <p className="font-medium">{r.employee}</p>
                  <p className="text-xs text-muted-foreground">{r.period} · Reviewer: {r.reviewer}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {r.rating > 0 && (
                  <div className="flex items-center gap-2 min-w-[160px]">
                    <Progress value={(r.rating/5)*100} className="h-2 w-24" />
                    <span className="text-sm font-semibold flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-warning text-warning" />{r.rating}</span>
                  </div>
                )}
                <Badge variant="outline" className={r.status === "Completed" ? "bg-success/15 text-success border-success/20" : "bg-warning/15 text-warning border-warning/20"}>{r.status}</Badge>
                <Button size="sm" variant="outline">Open</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
