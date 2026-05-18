import { useMemo, useState } from "react";
import { DollarSign, Filter, Target, TrendingUp, Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InvoiceStatusChart,
  LeadsStatusChart,
  OrdersStatusChart,
  RevenueTrendChart,
} from "@/modules/crm/components/crm-charts";
import { useCrmAnalytics } from "@/hooks/crm/use-crm";
import type { CrmAnalyticsFilters } from "@/modules/crm/types";
import { formatMoney } from "@/modules/crm/utils";

const defaultFrom = () => new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10);
const defaultTo = () => new Date().toISOString().slice(0, 10);

export function AnalyticsPage() {
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [applied, setApplied] = useState<CrmAnalyticsFilters>({ from: defaultFrom(), to: defaultTo() });

  const { data, isLoading, isFetching, refetch } = useCrmAnalytics(applied);

  const summary = data?.summary;
  const loading = isLoading || isFetching;

  const rangeLabel = useMemo(() => {
    if (data?.range?.from && data?.range?.to) {
      return `${data.range.from} → ${data.range.to}`;
    }
    return "All time";
  }, [data?.range]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Analytics"
        description="Server-aggregated KPIs from CRM leads, orders, invoices and payments."
        breadcrumbs={[{ label: "CRM & Sales" }, { label: "Analytics" }]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setApplied({ from, to, top_limit: 5 })}
            disabled={loading}
          >
            <Filter className="mr-2 h-4 w-4" />
            Apply filters
          </Button>
        }
      />

      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-3">
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
              setApplied({});
              refetch();
            }}
          >
            Clear range
          </Button>
          <span className="text-xs text-muted-foreground">Showing: {rangeLabel}</span>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Revenue (issued)"
          value={loading ? "…" : formatMoney(summary?.revenue ?? 0)}
          change={`${summary?.invoice_count ?? 0} invoices`}
          icon={DollarSign}
        />
        <StatCard
          label="Open AR"
          value={loading ? "…" : formatMoney(summary?.open_ar ?? 0)}
          icon={Target}
          accent="bg-violet-500"
        />
        <StatCard
          label="Open leads"
          value={loading ? "…" : String(summary?.open_leads ?? 0)}
          icon={Users}
          accent="bg-cyan-500"
        />
        <StatCard
          label="Fulfilled orders"
          value={loading ? "…" : String(summary?.fulfilled_orders ?? 0)}
          change={`${summary?.order_count ?? 0} total`}
          icon={TrendingUp}
          accent="bg-emerald-500"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Revenue trend</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <RevenueTrendChart data={data?.revenue_trend ?? []} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leads by status</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <LeadsStatusChart data={data?.leads_by_status ?? []} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Orders by status</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <OrdersStatusChart data={data?.orders_by_status ?? []} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invoices by status</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <InvoiceStatusChart data={data?.invoices_by_status ?? []} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top invoices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data?.top_invoices ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No issued invoices in this range.</p>
            ) : (
              data?.top_invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between rounded-lg border p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{inv.number}</p>
                    <p className="text-xs text-muted-foreground">{inv.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatMoney(inv.total_amount)}</p>
                    <p className="text-xs text-muted-foreground">{inv.status}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
