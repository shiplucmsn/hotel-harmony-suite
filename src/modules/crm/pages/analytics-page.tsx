import { useMemo } from "react";
import { DollarSign, Target, TrendingUp, Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InvoiceStatusChart,
  LeadsStatusChart,
  OrdersStatusChart,
  RevenueTrendChart,
} from "@/modules/crm/components/crm-charts";
import {
  useCrmInvoices,
  useCrmLeads,
  useCrmOrders,
  useCrmPayments,
} from "@/hooks/crm/use-crm";
import {
  buildLeadsByStatus,
  buildOrdersByStatus,
  buildRevenueTrend,
  crmAnalyticsSummary,
  formatMoney,
} from "@/modules/crm/utils";

export function AnalyticsPage() {
  const { data: leadsData, isLoading: leadsLoading } = useCrmLeads({ per_page: 500 });
  const { data: ordersData, isLoading: ordersLoading } = useCrmOrders({ per_page: 500 });
  const { data: invoicesData, isLoading: invoicesLoading } = useCrmInvoices({ per_page: 500 });
  const { data: paymentsData, isLoading: paymentsLoading } = useCrmPayments({ per_page: 500 });

  const leads = leadsData?.data ?? [];
  const orders = ordersData?.data ?? [];
  const invoices = invoicesData?.data ?? [];
  const payments = paymentsData?.data ?? [];

  const summary = useMemo(
    () => crmAnalyticsSummary(leads, invoices, payments, orders),
    [leads, invoices, payments, orders],
  );

  const revenueTrend = useMemo(() => buildRevenueTrend(invoices), [invoices]);
  const leadsByStatus = useMemo(() => buildLeadsByStatus(leads), [leads]);
  const ordersByStatus = useMemo(() => buildOrdersByStatus(orders), [orders]);

  const invoicesByStatus = useMemo(() => {
    const counts = new Map<string, number>();
    for (const inv of invoices) {
      const key = inv.status || "draft";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
  }, [invoices]);

  const topInvoices = useMemo(
    () =>
      [...invoices]
        .filter((i) => i.status !== "void" && i.status !== "draft")
        .sort((a, b) => b.total_amount - a.total_amount)
        .slice(0, 5),
    [invoices],
  );

  const loading = leadsLoading || ordersLoading || invoicesLoading || paymentsLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Analytics"
        description="Live KPIs from CRM leads, orders, invoices and payments."
        breadcrumbs={[{ label: "CRM & Sales" }, { label: "Analytics" }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Revenue (issued)"
          value={loading ? "…" : formatMoney(summary.revenue)}
          change={`${summary.invoiceCount} invoices`}
          icon={DollarSign}
        />
        <StatCard
          label="Open AR"
          value={loading ? "…" : formatMoney(summary.openAr)}
          icon={Target}
          accent="bg-violet-500"
        />
        <StatCard
          label="Open leads"
          value={loading ? "…" : String(summary.openLeads)}
          icon={Users}
          accent="bg-cyan-500"
        />
        <StatCard
          label="Fulfilled orders"
          value={loading ? "…" : String(summary.fulfilledOrders)}
          change={`${summary.orderCount} total`}
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
            <RevenueTrendChart data={revenueTrend} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leads by status</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <LeadsStatusChart data={leadsByStatus} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Orders by status</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <OrdersStatusChart data={ordersByStatus} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invoices by status</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <InvoiceStatusChart data={invoicesByStatus} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top invoices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topInvoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No issued invoices yet.</p>
            ) : (
              topInvoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  <div>
                    <div className="font-medium">{inv.number}</div>
                    <div className="text-xs text-muted-foreground">{inv.customer}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatMoney(inv.total_amount)}</div>
                    <div className="text-xs text-muted-foreground">{inv.status}</div>
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
