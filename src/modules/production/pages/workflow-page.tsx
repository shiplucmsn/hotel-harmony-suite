import { Link } from "@tanstack/react-router";
import {
  Boxes,
  ClipboardList,
  Factory,
  Hammer,
  Loader2,
  Package,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/stat-card";
import { useProductionWorkflow } from "@/hooks/production/use-production";
import type { ProductionWorkflowStageDto } from "@/modules/production/types";

const STAGE_LINKS: Record<string, string> = {
  raw_materials: "/app/prod/raw-materials",
  planning: "/app/prod/planning",
  in_production: "/app/prod/work-orders",
  quality: "/app/prod/quality",
  finished_goods: "/app/prod/finished-goods",
};

const STAGE_ICONS: Record<string, typeof Boxes> = {
  raw_materials: Boxes,
  planning: ClipboardList,
  in_production: Hammer,
  quality: ShieldCheck,
  finished_goods: Package,
};

const STAGE_SHORT_LABELS: Record<string, string> = {
  raw_materials: "Raw",
  planning: "Plan",
  in_production: "WIP",
  quality: "QC",
  finished_goods: "FG",
};

function statusTone(status: string) {
  if (status === "completed") return "bg-success/15 text-success border-success/30";
  if (status === "in_progress" || status === "released") return "bg-primary/15 text-primary border-primary/30";
  if (status === "cancelled") return "bg-destructive/15 text-destructive border-destructive/30";
  return "bg-muted text-muted-foreground border-border";
}

function StageCard({ stage }: { stage: ProductionWorkflowStageDto }) {
  const Icon = STAGE_ICONS[stage.key] ?? Factory;
  const href = STAGE_LINKS[stage.key];
  const shortLabel = STAGE_SHORT_LABELS[stage.key] ?? stage.label;

  const inner = (
    <div
      className="flex h-full min-w-0 flex-col gap-1 rounded-lg border bg-card/60 p-2 transition-shadow hover:shadow-md sm:gap-1.5 sm:p-2.5"
      title={`${stage.label} — ${stage.hint}`}
    >
      <div className="flex items-center justify-between gap-1">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary sm:h-7 sm:w-7">
          <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </div>
        <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-semibold tabular-nums">
          {stage.count}
        </Badge>
      </div>
      <p className="truncate text-[11px] font-medium leading-none sm:text-xs">{shortLabel}</p>
      <p className="hidden truncate text-[10px] text-muted-foreground leading-tight sm:block">{stage.hint}</p>
      <div className="mt-auto h-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full gradient-primary" style={{ width: `${stage.load_percent}%` }} />
      </div>
    </div>
  );

  if (href) {
    return (
      <Link to={href} className="block min-w-0">
        {inner}
      </Link>
    );
  }

  return <div className="min-w-0">{inner}</div>;
}

export function WorkflowPage() {
  const { data, isLoading, isError, isFetching, refetch } = useProductionWorkflow();

  const summary = data?.summary;
  const stages = data?.stages ?? [];
  const activeOrders = data?.active_work_orders ?? [];
  const throughput = data?.throughput ?? [];

  return (
    <div className="min-w-0 w-full space-y-6">
      <PageHeader
        title="Factory Workflow"
        description="Live pipeline from BOM raw materials through work orders, quality, and finished goods inventory."
        breadcrumbs={[{ label: "Production" }, { label: "Workflow" }]}
        actions={
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <EmptyState
          title="Could not load workflow"
          description="Check API connection and production permissions, then retry."
          action={
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Planning queue" value={String(summary?.planning_queue ?? 0)} icon={ClipboardList} />
            <StatCard label="In production" value={String(summary?.in_production ?? 0)} icon={Hammer} />
            <StatCard
              label="Completed this week"
              value={String(summary?.completed_this_week ?? 0)}
              icon={Factory}
            />
            <StatCard label="FG on hand" value={String(summary?.finished_on_hand ?? 0)} icon={Package} />
          </div>

          <Card className="glass min-w-0">
            <CardContent className="p-3 sm:p-4">
              <div className="grid w-full min-w-0 grid-cols-5 gap-1.5 sm:gap-2">
                {stages.map((stage) => (
                  <StageCard key={stage.key} stage={stage} />
                ))}
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground sm:text-xs">
                BOM components → planning → production → QC → finished stock. Tap a stage to open.
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Active work orders</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/app/prod/work-orders">View all</Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No released or in-progress work orders.{" "}
                    <Link to="/app/prod/planning" className="text-primary underline-offset-2 hover:underline">
                      Schedule from planning
                    </Link>
                  </p>
                ) : (
                  activeOrders.map((wo) => (
                    <Link
                      key={wo.id}
                      to="/app/prod/work-orders"
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/40 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{wo.product_label}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {wo.number}
                          {wo.scheduled_date ? ` · ${wo.scheduled_date}` : ""}
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <Badge variant="outline" className={statusTone(wo.status)}>
                          {wo.progress_label}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1 w-20">
                          <Progress value={wo.progress_percent} className="h-1.5" />
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Capacity & lines</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/app/prod/machines">Machines</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {throughput.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    Add machines or schedule work orders to see load.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {throughput.map((line) => (
                      <div key={line.name}>
                        <div className="flex justify-between text-sm gap-2">
                          <span className="truncate">{line.name}</span>
                          <span className="text-muted-foreground shrink-0">
                            {line.actual}/{line.target}
                          </span>
                        </div>
                        <div className="mt-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full gradient-primary"
                            style={{ width: `${line.load_percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {(summary?.raw_low_stock ?? 0) > 0 && (
            <Card className="border-warning/40 bg-warning/5">
              <CardContent className="py-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm">
                  <span className="font-medium">{summary?.raw_low_stock}</span> raw material SKU
                  {(summary?.raw_low_stock ?? 0) === 1 ? "" : "s"} below reorder point.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/app/prod/raw-materials">Review materials</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
