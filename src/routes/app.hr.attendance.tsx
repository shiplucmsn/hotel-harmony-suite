import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, XCircle, CalendarCheck, ArrowRight } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { attendanceTrend } from "@/lib/hr-mock";

export const Route = createFileRoute("/app/hr/attendance")({ component: AttendancePage });

function AttendancePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Real-time view of today's attendance."
        breadcrumbs={[{ label: "HR" }, { label: "Attendance" }]}
        actions={<Button asChild size="sm" variant="outline"><Link to="/app/hr/attendance/daily">Daily log<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Present today" value="218" change="+2.1%" icon={CheckCircle2} accent="bg-success" />
        <StatCard label="Late" value="14" change="-0.8%" icon={Clock} trend="down" accent="bg-warning" />
        <StatCard label="Absent" value="6" change="-12%" icon={XCircle} trend="down" accent="bg-destructive" />
        <StatCard label="On leave" value="9" change="+1.2%" icon={CalendarCheck} accent="bg-info" />
      </div>

      <Card>
        <CardHeader><CardTitle>This week</CardTitle></CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="present" stackId="a" fill="hsl(var(--success))" radius={[0, 0, 0, 0]} />
                <Bar dataKey="late" stackId="a" fill="hsl(var(--warning))" />
                <Bar dataKey="absent" stackId="a" fill="hsl(var(--destructive))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Punctuality", value: 92 },
          { label: "Attendance rate", value: 96 },
          { label: "Avg. hours / day", value: 88 },
        ].map((m) => (
          <Card key={m.label}>
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{m.label}</p>
              <p className="mt-1 text-2xl font-semibold">{m.value}%</p>
              <Progress value={m.value} className="mt-3 h-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
