import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, MoreHorizontal, Calendar, DollarSign } from "lucide-react";
import { deals, stages } from "@/lib/crm-mock";
import { cn } from "@/lib/utils";

const stageColor: Record<string, string> = {
  Lead: "bg-slate-500",
  Qualified: "bg-info",
  Proposal: "bg-violet-500",
  Negotiation: "bg-warning",
  Won: "bg-success",
  Lost: "bg-destructive",
};

export const Route = createFileRoute("/app/crm/pipeline")({
  component: () => (
    <div className="space-y-6">
      <PageHeader
        title="Sales Pipeline"
        description="Drag-and-drop kanban view of every active deal."
        breadcrumbs={[{ label: "CRM & Sales" }, { label: "Pipeline" }]}
        actions={<Button className="gradient-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-2" />New Deal</Button>}
      />

      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        {stages.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage);
          const total = stageDeals.reduce((s, d) => s + d.value, 0);
          return (
            <div key={stage} className="w-72 shrink-0">
              <div className="rounded-xl bg-muted/50 p-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", stageColor[stage])} />
                    <span className="font-semibold text-sm">{stage}</span>
                    <Badge variant="secondary" className="text-xs">{stageDeals.length}</Badge>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7"><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="text-xs text-muted-foreground mb-3">${total.toLocaleString()}</div>
                <div className="space-y-2">
                  {stageDeals.map((d) => (
                    <Card key={d.id} className="cursor-grab hover:shadow-elegant transition-shadow active:cursor-grabbing">
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="font-medium text-sm">{d.title}</div>
                          <Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="h-3 w-3" /></Button>
                        </div>
                        <div className="text-xs text-muted-foreground">{d.customer}</div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1 font-semibold text-foreground"><DollarSign className="h-3 w-3" />{d.value.toLocaleString()}</span>
                          <span className="flex items-center gap-1 text-muted-foreground"><Calendar className="h-3 w-3" />{d.closeDate}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <Avatar className="h-6 w-6"><AvatarFallback className="text-[10px]">{d.owner.split(" ").map((n) => n[0]).join("")}</AvatarFallback></Avatar>
                          <Badge variant="outline" className="text-[10px]">{d.probability}%</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  ),
});
