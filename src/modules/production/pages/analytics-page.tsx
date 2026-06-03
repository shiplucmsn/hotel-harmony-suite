import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  DollarSign,
  Factory,
  Filter,
  Loader2,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useProductionAnalytics } from "@/hooks/production/use-production";
import {
  ProductionCostBreakdownChart,
  ProductionOutputTrendChart,
  ProductionQcResultsChart,
  ProductionYieldTrendChart,
} from "@/modules/production/components/production-analytics-charts";
import type { ProductionAnalyticsFilters } from "@/modules/production/types";

const defaultFrom = () => new Date(Date.now() - 1000 * 60 * 60 * 24 * 29).toISOString().slice(0, 10);
const defaultTo = () => new Date().toISOString().slice(0, 10);

function formatMoney(value: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(value);
}

export function ProductionAnalyticsPage() {
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [applied, setApplied] = useState<ProductionAnalyticsFilters>({
    from: defaultFrom(),
    to: defaultTo(),
  });

  const { data, isLoading, isError, isFetching, refetch } = useProductionAnalytics(applied);

  const summary = data?.summary;
  const loading = isLoading || isFetching;

  const rangeLabel = useMemo(() => {
    if (data?.range?.from && data?.range?.to) {
      return `${data.range.from} → ${data.range.to}`;
    }
    return "Last 30 days";
  }, [data?.range]);

  const outputChart = useMemo(
    () =>
      (data?.output_trend ?? []).map((row) => ({
        day: row.label,
        actual: row.actual,
      })),
    [data?.output_trend],
  );

  const yieldChart = useMemo(
    () =>
      (data?.yield_trend ?? []).map((row) => ({
        week: row.label,
        oee: row.yield_percent,
      })),
    [data?.yield_trend],
  );

  const qcChart = useMemo(
    () =>
      (data?.qc_by_result ?? []).map((row) => ({
        name: row.result,
        value: row.count,
      })),
    [data?.qc_by_result],
  );

  const yieldDomain = useMemo(() => {
    const values = yieldChart.map((r) => r.oee);
    if (values.length === 0) return [0, 100] as [number, number];
    const min = Math.max(0, Math.min(...values) - 10);
    const max = Math.min(100, Math.max(...values) + 10);
    return [min, max] as [number, number];
  }, [yieldChart]);

  const costBreakdown = data?.cost_breakdown;

  return (
    <div className="min-w-0 w-full space-y-6">
      <PageHeader
        title="Production Analytics"
        description="Throughput, yield, QC pass rate, and costing from completed work orders and inspections."
        breadcrumbs={[{ label: "Production" }, { label: "Analytics" }]}
        actions={
          <Button variant="outline" size="sm" onClick={() => setApplied({ from, to })} disabled={loading}>
            <Filter className="mr-2 h-4 w-4" />
            Apply filters
          </Button>
        }
      />

      <Card className="border-border/80 shadow-sm">
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">From</label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">To</label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const f = defaultFrom();
              const t = defaultTo();
              setFrom(f);
              setTo(t);
              setApplied({ from: f, to: t });
            }}
          >
            Reset range
          </Button>
          <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">{rangeLabel}</span>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <EmptyState
          title="Could not load analytics"
          description="Check API connection and production permissions."
          action={
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Output (range)"
              value={loading ? "…" : String(summary?.output_qty ?? 0)}
              change={`${summary?.work_orders_completed ?? 0} completed WOs`}
              icon={Factory}
            />
            <StatCard
              label="Yield"
              value={loading ? "…" : `${summary?.yield_percent ?? 0}%`}
              change={`${summary?.planned_qty ?? 0} planned`}
              icon={Activity}
            />
            <StatCard
              label="QC pass rate"
              value={loading ? "…" : `${summary?.qc_pass_rate ?? 0}%`}
              change={`${summary?.qc_inspections ?? 0} inspections`}
              icon={ShieldCheck}
              accent="bg-cyan-500"
            />
            <StatCard
              label="Throughput"
              value={loading ? "…" : `${summary?.throughput_per_wo ?? 0}/WO`}
              change={`${summary?.work_orders_open ?? 0} open WOs`}
              icon={TrendingUp}
              accent="bg-emerald-500"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Production cost"
              value={loading ? "…" : formatMoney(summary?.production_cost_total ?? 0)}
              icon={DollarSign}
            />
            <StatCard
              label="Waste cost"
              value={loading ? "…" : formatMoney(summary?.waste_cost_total ?? 0)}
              icon={DollarSign}
              accent="bg-warning"
            />
            <StatCard
              label="Avg machine OEE"
              value={loading ? "…" : `${summary?.machine_oee_avg ?? 0}%`}
              icon={Activity}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="overflow-hidden border-border/80 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Output trend</CardTitle>
                <CardDescription>Finished quantity by day (completed work orders)</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] pb-4">
                <ProductionOutputTrendChart data={outputChart} />
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-border/80 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Weekly yield</CardTitle>
                <CardDescription>Actual vs planned — last 6 weeks</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] pb-4">
                <ProductionYieldTrendChart data={yieldChart} domain={yieldDomain} />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="overflow-hidden border-border/80 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Cost breakdown</CardTitle>
                <CardDescription>Material and overhead from completed work orders</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] pb-2">
                {costBreakdown ? (
                  <ProductionCostBreakdownChart breakdown={costBreakdown} />
                ) : (
                  <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No costing data
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-border/80 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Quality inspections</CardTitle>
                <CardDescription>Pass, fail, and rework in selected range</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] pb-4">
                {qcChart.length === 0 ? (
                  <p className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                    <span>No inspections in range.</span>
                    <Link to="/app/prod/quality" className="text-primary font-medium underline-offset-2 hover:underline">
                      Record QC
                    </Link>
                  </p>
                ) : (
                  <ProductionQcResultsChart data={qcChart} />
                )}
              </CardContent>
            </Card>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Output and costs use completed work orders by completion date. QC uses inspection dates. Stock impact
            remains on the inventory movement ledger.
          </p>
        </>
      )}
    </div>
  );
}
