import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/stat-card";
import { projects, tasks, activities, burndown, pmTone } from "@/lib/pm-mock";
import { Briefcase, CheckSquare, Clock, AlertTriangle, Plus } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

export const Route = createFileRoute("/app/pm/dashboard")({ component: PMDashboardPage });

function PMDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Dashboard"
        description="Portfolio health, deadlines and team activity."
        breadcrumbs={[{ label: "Projects" }, { label: "Dashboard" }]}
        actions={<Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-2" />New project</Button>}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Active projects" value={String(projects.filter(p => p.status === "active").length)} change="+2" icon={Briefcase} />
        <StatCard label="Open tasks" value={String(tasks.filter(t => t.status !== "done").length)} icon={CheckSquare} />
        <StatCard label="Hours logged (wk)" value="186" change="+8%" icon={Clock} />
        <StatCard label="At risk" value={String(projects.filter(p => p.status === "at_risk").length)} change="-1" trend="down" icon={AlertTriangle} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Sprint burndown</CardTitle></CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={burndown}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Legend />
                <Line dataKey="planned" stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
                <Line dataKey="actual" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent activity</CardTitle></CardHeader>
          <CardContent className="space-y-3 max-h-[280px] overflow-auto">
            {activities.map(a => (
              <div key={a.id} className="flex gap-2 text-sm">
                <div className="h-7 w-7 rounded-full gradient-primary text-primary-foreground grid place-items-center text-[10px] font-semibold shrink-0">{a.who.split(" ").map(s=>s[0]).join("")}</div>
                <div className="flex-1">
                  <div className="text-xs"><span className="font-medium">{a.who}</span> {a.what} <span className="font-medium">{a.target}</span> {a.to && <Badge variant="outline" className="ml-1 text-[10px]">{a.to}</Badge>}</div>
                  <div className="text-[11px] text-muted-foreground">{a.when}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Active projects</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {projects.slice(0, 6).map(p => (
            <Link key={p.id} to="/app/pm/tasks" className="block">
              <Card className="transition-all hover:shadow-elegant hover:-translate-y-0.5">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.client} · {p.lead}</div>
                    </div>
                    <Badge variant="outline" className={pmTone(p.status)}>{p.status.replace("_"," ")}</Badge>
                  </div>
                  <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Progress</span><span>{p.progress}%</span></div>
                  <Progress value={p.progress} className="h-1.5" />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground"><span>Due {p.due}</span><span>${(p.spent/1000).toFixed(0)}k / ${(p.budget/1000).toFixed(0)}k</span></div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
