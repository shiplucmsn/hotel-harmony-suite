import { useMemo, useState } from "react";
import { AlertTriangle, DollarSign, Download } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SaasNav } from "@/modules/saas/components/saas-nav";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";
import {
  useIssueSaasInvoice,
  useMarkSaasInvoicePaid,
  useSaasInvoices,
  useSaasSubscriptions,
  useSaasTenants,
} from "@/hooks/saas/use-saas";
import { computePlatformMetrics, formatMoney } from "@/modules/saas/saas-utils";

export function BillingPage() {
  const [tenantId, setTenantId] = useState<string>("");
  const { data: tenantsRes } = useSaasTenants({ per_page: 100 });
  const { data: subsRes } = useSaasSubscriptions({ per_page: 200 });
  const { data: invoicesRes, isLoading } = useSaasInvoices(tenantId, { per_page: 50 });

  const tenants = tenantsRes?.data ?? [];
  const subscriptions = subsRes?.data ?? [];
  const invoices = invoicesRes?.data ?? [];

  const metrics = useMemo(
    () => computePlatformMetrics(subscriptions, invoices, tenants.length),
    [subscriptions, invoices, tenants.length]
  );

  const issueInvoice = useIssueSaasInvoice();
  const markPaid = useMarkSaasInvoicePaid();

  const subForTenant = subscriptions.find((s) => s.tenant_id === tenantId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="SaaS billing"
        description="Subscription invoices, collections and outstanding balances."
        breadcrumbs={[{ label: "Platform" }, { label: "SaaS" }, { label: "Billing" }]}
      />
      <SaasNav />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Outstanding" value={formatMoney(metrics.outstanding)} icon={DollarSign} accent="bg-warning" />
        <StatCard label="Collected" value={formatMoney(metrics.collected)} icon={DollarSign} accent="bg-success" />
        <StatCard label="Failed / overdue" value={String(metrics.failedPayments)} icon={AlertTriangle} accent="bg-destructive" />
        <StatCard label="Platform MRR" value={formatMoney(metrics.mrr)} icon={DollarSign} />
      </div>

      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>Select a tenant to view and manage subscription invoices</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={tenantId} onValueChange={setTenantId}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Select tenant" />
              </SelectTrigger>
              <SelectContent>
                {tenants.map((t) => (
                  <SelectItem key={t.id} value={t.slug}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {subForTenant ? (
              <Button
                size="sm"
                variant="outline"
                disabled={issueInvoice.isPending}
                onClick={() => issueInvoice.mutate({ subscription_id: subForTenant.id, tax_rate: 0, due_days: 7 })}
              >
                Issue invoice
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          {!tenantId ? (
            <EmptyState title="Select tenant" description="Choose a tenant to load billing invoices." />
          ) : isLoading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Loading invoices…</p>
          ) : invoices.length === 0 ? (
            <EmptyState title="No invoices" description="Issue a subscription invoice for this tenant." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Due</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono text-xs">{inv.invoice_no}</TableCell>
                    <TableCell>
                      <Badge variant={inv.status === "paid" ? "default" : inv.status === "open" ? "secondary" : "outline"}>
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatMoney(inv.total_amount, inv.currency_code)}</TableCell>
                    <TableCell className="text-right">{formatMoney(inv.due_amount, inv.currency_code)}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {inv.issued_at ? new Date(inv.issued_at).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {inv.status !== "paid" ? (
                        <Button size="sm" variant="ghost" onClick={() => markPaid.mutate({ id: inv.id })}>
                          Mark paid
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" disabled>
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
