import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Boxes, Hammer, ShieldCheck, Package, Truck } from "lucide-react";
import { workOrders, prodTone } from "@/lib/production-mock";

export const Route = createFileRoute("/app/prod/workflow")({ component: WorkflowPage });

const stages = [
  { key: "raw", label: "Raw materials", icon: Boxes, count: 6 },
  { key: "wo", label: "In production", icon: Hammer, count: 3 },
  { key: "qc", label: "Quality check", icon: ShieldCheck, count: 1 },
  { key: "fg", label: "Finished goods", icon: Package, count: 4 },
  { key: "out", label: "Shipping", icon: Truck, count: 2 },
];

function WorkflowPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Factory Workflow"
        description="Real-time view of every stage in the production pipeline."
        breadcrumbs={[{ label: "Production" }, { label: "Workflow" }]}
      />

      <Card className="glass">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row items-stretch gap-3">
            {stages.map((s, i) => (
              <div key={s.key} className="flex items-center gap-3 flex-1">
                <div className="flex-1 rounded-xl border bg-card/60 p-4 backdrop-blur transition-all hover:shadow-elegant hover:-translate-y-0.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <s.icon className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-sm">{s.label}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">{s.count}</Badge>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full gradient-primary" style={{ width: `${20 + i * 15}%` }} />
                  </div>
                </div>
                {i < stages.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground hidden lg:block" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Active work orders</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {workOrders.filter(w => w.status === "in_progress" || w.status === "qc").map(w => (
              <div key={w.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="font-medium text-sm">{w.product}</div>
                  <div className="text-xs text-muted-foreground">{w.number} · {w.assignee}</div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className={prodTone(w.status)}>{w.status.replace("_"," ")}</Badge>
                  <div className="text-xs text-muted-foreground mt-1">{w.progress}%</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Live throughput</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { line: "Line A — Assembly", rate: 96, target: 100 },
                { line: "Line B — Molding", rate: 0, target: 80 },
                { line: "Line C — Bottling", rate: 142, target: 160 },
                { line: "QC Cell", rate: 38, target: 50 },
              ].map(l => (
                <div key={l.line}>
                  <div className="flex justify-between text-sm"><span>{l.line}</span><span className="text-muted-foreground">{l.rate}/{l.target}</span></div>
                  <div className="mt-1 h-2 rounded-full bg-muted overflow-hidden"><div className="h-full gradient-primary" style={{ width: `${(l.rate/l.target)*100}%` }} /></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
