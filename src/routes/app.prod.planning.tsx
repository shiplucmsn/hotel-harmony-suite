import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/stat-card";
import { workOrders, prodTone, productionTrend } from "@/lib/production-mock";
import { Calendar, ClipboardList, Plus, Factory, TrendingUp } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

export const Route = createFileRoute("/app/prod/planning")({ component: PlanningPage });

function PlanningPage() {
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  return (
    <div className="space-y-6">
      <PageHeader
        title="Production Planning"
        description="Schedule and balance work across lines and shifts."
        breadcrumbs={[{ label: "Production" }, { label: "Planning" }]}
        actions={<Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-2" />Schedule order</Button>}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Scheduled WO" value="14" change="+12%" icon={Calendar} />
        <StatCard label="In progress" value="6" change="+3" icon={Factory} />
        <StatCard label="Backlog" value="3" change="-2" trend="down" icon={ClipboardList} />
        <StatCard label="On-time rate" value="94%" change="+2.4%" icon={TrendingUp} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Planned vs actual (this week)</CardTitle></CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="planned" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
                <Bar dataKey="actual" fill="hsl(var(--success))" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Capacity</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { line: "Line A", load: 92 },
              { line: "Line B", load: 64 },
              { line: "Line C", load: 78 },
              { line: "QC Cell", load: 41 },
            ].map(l => (
              <div key={l.line} className="space-y-1">
                <div className="flex justify-between text-sm"><span>{l.line}</span><span className="text-muted-foreground">{l.load}%</span></div>
                <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full gradient-primary" style={{ width: `${l.load}%` }} /></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Schedule board</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 text-xs">
            {days.map((d, i) => (
              <div key={d} className="rounded-lg border bg-muted/30 p-2 min-h-[140px]">
                <div className="font-semibold mb-2">{d}</div>
                {workOrders.slice(i, i+2).map(w => (
                  <div key={w.id} className="mb-1.5 rounded-md border bg-card p-2">
                    <div className="font-medium truncate">{w.product}</div>
                    <div className="text-muted-foreground">{w.qty} units</div>
                    <Badge variant="outline" className={`mt-1 ${prodTone(w.status)} text-[10px]`}>{w.status}</Badge>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
