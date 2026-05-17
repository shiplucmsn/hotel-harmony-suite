import type { CrmInvoiceDto, CrmLeadDto, CrmOrderDto, CrmPaymentDto } from "@/modules/crm/types";

export function formatMoney(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export const leadStatusTone: Record<string, string> = {
  new: "bg-info/10 text-info",
  contacted: "bg-warning/10 text-warning",
  qualified: "bg-success/10 text-success",
  lost: "bg-destructive/10 text-destructive",
  converted: "bg-primary/10 text-primary",
};

export const orderStatusTone: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-warning/10 text-warning",
  confirmed: "bg-info/10 text-info",
  fulfilled: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

export const invoiceStatusTone: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  issued: "bg-info/10 text-info",
  partial: "bg-warning/10 text-warning",
  paid: "bg-success/10 text-success",
  void: "bg-destructive/10 text-destructive",
};

export function customerLabel(
  customerId: number | null | undefined,
  map: Map<number, string>,
): string {
  if (!customerId) return "—";
  return map.get(customerId) ?? `Customer #${customerId}`;
}

export function buildLeadsByStatus(leads: CrmLeadDto[]) {
  const counts = new Map<string, number>();
  for (const lead of leads) {
    const key = lead.status || "new";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
}

export function buildRevenueTrend(invoices: CrmInvoiceDto[]) {
  const byMonth = new Map<string, { revenue: number; invoices: number }>();
  for (const inv of invoices) {
    if (!inv.issued || inv.status === "draft" || inv.status === "void") continue;
    const month = inv.issued.slice(0, 7);
    const row = byMonth.get(month) ?? { revenue: 0, invoices: 0 };
    row.revenue += inv.total_amount;
    row.invoices += 1;
    byMonth.set(month, row);
  }
  return Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, row]) => ({
      month,
      revenue: Math.round(row.revenue * 100) / 100,
      invoices: row.invoices,
    }));
}

export function buildOrdersByStatus(orders: CrmOrderDto[]) {
  const counts = new Map<string, number>();
  for (const order of orders) {
    const key = order.status || "pending";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
}

export function crmAnalyticsSummary(
  leads: CrmLeadDto[],
  invoices: CrmInvoiceDto[],
  payments: CrmPaymentDto[],
  orders: CrmOrderDto[],
) {
  const issuedInvoices = invoices.filter((i) => i.status !== "draft" && i.status !== "void");
  const revenue = issuedInvoices.reduce((s, i) => s + i.total_amount, 0);
  const collected = payments.reduce((s, p) => s + p.amount, 0);
  const openAr = issuedInvoices.reduce((s, i) => s + i.balance_due, 0);
  const openLeads = leads.filter((l) => !["converted", "lost"].includes(l.status)).length;
  const fulfilledOrders = orders.filter((o) => o.status === "fulfilled").length;

  return {
    revenue,
    collected,
    openAr,
    openLeads,
    fulfilledOrders,
    invoiceCount: issuedInvoices.length,
    orderCount: orders.length,
  };
}
