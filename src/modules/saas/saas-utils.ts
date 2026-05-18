import type { SaasBillingInvoiceDto, SaasPlanDto, SaasSubscriptionDto } from "@/modules/saas/types";

export function formatMoney(value: number, currency = "USD"): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}

export function subscriptionMrr(sub: SaasSubscriptionDto): number {
  if (!sub.plan) return 0;
  if (!["trial", "active", "grace"].includes(sub.status)) return 0;
  return sub.billing_cycle === "yearly"
    ? Number(sub.plan.price_yearly) / 12
    : Number(sub.plan.price_monthly);
}

export function computePlatformMetrics(
  subscriptions: SaasSubscriptionDto[],
  invoices: SaasBillingInvoiceDto[],
  tenantCount: number
) {
  const activeSubs = subscriptions.filter((s) => ["trial", "active", "grace"].includes(s.status));
  const mrr = activeSubs.reduce((sum, s) => sum + subscriptionMrr(s), 0);
  const arr = mrr * 12;
  const paidInvoices = invoices.filter((i) => i.status === "paid");
  const collected = paidInvoices.reduce((sum, i) => sum + Number(i.paid_amount || i.total_amount), 0);
  const outstanding = invoices.reduce((sum, i) => sum + Number(i.due_amount), 0);
  const failed = invoices.filter((i) => i.status === "open" && i.due_at && new Date(i.due_at) < new Date()).length;

  const byPlan = new Map<string, { name: string; count: number; mrr: number }>();
  for (const sub of activeSubs) {
    const key = sub.plan?.code ?? "unknown";
    const row = byPlan.get(key) ?? { name: sub.plan?.name ?? key, count: 0, mrr: 0 };
    row.count += 1;
    row.mrr += subscriptionMrr(sub);
    byPlan.set(key, row);
  }

  return {
    tenantCount,
    activeSubscriptions: activeSubs.length,
    mrr,
    arr,
    collected,
    outstanding,
    failedPayments: failed,
    planBreakdown: Array.from(byPlan.values()),
  };
}

export function revenueByMonth(invoices: SaasBillingInvoiceDto[]): Array<{ month: string; revenue: number }> {
  const map = new Map<string, number>();
  for (const inv of invoices.filter((i) => i.status === "paid")) {
    const date = inv.paid_at ?? inv.issued_at ?? inv.created_at;
    if (!date) continue;
    const month = date.slice(0, 7);
    map.set(month, (map.get(month) ?? 0) + Number(inv.paid_amount || inv.total_amount));
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({ month, revenue }));
}

export function planPriceLabel(plan: SaasPlanDto, cycle: "monthly" | "yearly" = "monthly"): string {
  return formatMoney(cycle === "yearly" ? plan.price_yearly : plan.price_monthly, plan.currency_code);
}
