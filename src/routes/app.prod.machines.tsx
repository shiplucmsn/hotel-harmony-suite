import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/stat-card";
import { machines, prodTone } from "@/lib/production-mock";
import { Cpu, Wrench, Plus, Activity, Power, Settings2 } from "lucide-react";

export const Route = createFileRoute("/app/prod/machines")({ component: MachinesPage });

function MachinesPage() {
  const running = machines.filter(m => m.status === "running").length;
  const down = machines.filter(m => m.status === "down" || m.status === "maintenance").length;
  return (
    <div className="space-y-6">
      <PageHeader
        title="Machine Management"
        description="Monitor uptime, OEE, and maintenance windows."
        breadcrumbs={[{ label: "Production" }, { label: "Machines" }]}
        actions={<Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-2" />Add machine</Button>}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total machines" value={String(machines.length)} icon={Cpu} />
        <StatCard label="Running" value={String(running)} change="+2" icon={Power} />
        <StatCard label="Maintenance" value={String(down)} change="+1" trend="down" icon={Wrench} />
        <StatCard label="Avg OEE" value="78%" change="+3.1%" icon={Activity} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {machines.map(m => (
          <Card key={m.id} className="transition-all hover:shadow-elegant hover:-translate-y-0.5">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{m.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.code} · {m.line}</p>
                </div>
                <Badge variant="outline" className={prodTone(m.status)}>{m.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Uptime</span><span>{m.uptime}%</span></div>
                <Progress value={m.uptime} className="h-1.5" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">OEE</span><span>{m.oee}%</span></div>
                <Progress value={m.oee} className="h-1.5" />
              </div>
              <div className="flex items-center justify-between border-t pt-2 text-xs">
                <span className="text-muted-foreground">Last service: {m.lastService}</span>
                <Button variant="ghost" size="sm"><Settings2 className="h-3.5 w-3.5" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
