import { api } from "@/lib/api-client";
import type { ApiEnvelope } from "@/lib/api-meta";

function unwrap<T>(res: ApiEnvelope<T> | T): T {
  if (typeof res === "object" && res !== null && "data" in res) {
    return (res as ApiEnvelope<T>).data;
  }
  return res as T;
}

export const erpApi = {
  products: {
    list: () => api.get<ApiEnvelope<Record<string, unknown>[]> | Record<string, unknown>[]>("/v1/products").then(unwrap),
    create: (body: unknown) => api.post<ApiEnvelope<Record<string, unknown>>>("/v1/products", body, { idempotent: true }).then(unwrap),
    update: (id: string, body: unknown) => api.patch<ApiEnvelope<Record<string, unknown>>>(`/v1/products/${id}`, body, { idempotent: true }).then(unwrap),
  },
  sales: {
    list: () => api.get<ApiEnvelope<Record<string, unknown>[]> | Record<string, unknown>[]>("/v1/sales/orders").then(unwrap),
    create: (body: unknown) => api.post<ApiEnvelope<Record<string, unknown>>>("/v1/sales/orders", body, { idempotent: true }).then(unwrap),
  },
  inventory: {
    list: () => api.get<ApiEnvelope<Record<string, unknown>[]> | Record<string, unknown>[]>("/v1/inventory/items").then(unwrap),
    adjust: (body: unknown) => api.post<ApiEnvelope<Record<string, unknown>>>("/v1/inventory/adjustments", body, { idempotent: true }).then(unwrap),
  },
  invoices: {
    list: () => api.get<ApiEnvelope<Record<string, unknown>[]> | Record<string, unknown>[]>("/v1/crm/invoices").then(unwrap),
    create: (body: unknown) => api.post<ApiEnvelope<Record<string, unknown>>>("/v1/crm/invoices", body, { idempotent: true }).then(unwrap),
    update: (id: string, body: unknown) => api.patch<ApiEnvelope<Record<string, unknown>>>(`/v1/crm/invoices/${id}`, body, { idempotent: true }).then(unwrap),
    pay: (body: unknown) => api.post<ApiEnvelope<Record<string, unknown>>>("/v1/crm/payments", body, { idempotent: true }).then(unwrap),
    reconciliation: () => api.get<ApiEnvelope<{ balanced: boolean; issues: string[] }>>("/v1/reconciliation/summary").then(unwrap),
  },
  crm: {
    customers: () => api.get<ApiEnvelope<Record<string, unknown>[]> | Record<string, unknown>[]>("/v1/crm/customers").then(unwrap),
    orders: () => api.get<ApiEnvelope<Record<string, unknown>[]> | Record<string, unknown>[]>("/v1/crm/orders").then(unwrap),
    payments: () => api.get<ApiEnvelope<Record<string, unknown>[]> | Record<string, unknown>[]>("/v1/crm/invoices").then(unwrap),
  },
  warehouses: {
    list: () => api.get<ApiEnvelope<Record<string, unknown>[]> | Record<string, unknown>[]>("/v1/warehouses").then(unwrap),
    transfers: () => api.get<ApiEnvelope<Record<string, unknown>[]> | Record<string, unknown>[]>("/v1/inventory/transfers").then(unwrap),
    purchaseOrders: () => api.get<ApiEnvelope<Record<string, unknown>[]> | Record<string, unknown>[]>("/v1/purchase/orders").then(unwrap),
  },
  finance: {
    accounts: () => api.get<ApiEnvelope<Record<string, unknown>[]> | Record<string, unknown>[]>("/v1/finance/accounts").then(unwrap),
    journal: () => api.get<ApiEnvelope<Record<string, unknown>[]> | Record<string, unknown>[]>("/v1/finance/journal").then(unwrap),
    ledger: () => api.get<ApiEnvelope<Record<string, unknown>[]> | Record<string, unknown>[]>("/v1/finance/ledger").then(unwrap),
    profitLoss: () => api.get<ApiEnvelope<Record<string, unknown>>>("/v1/finance/profit-loss").then(unwrap),
  },
  reports: {
    dashboard: () => api.get<ApiEnvelope<Record<string, unknown>>>("/v1/reports/dashboard").then(unwrap),
    modules: () => api.get<ApiEnvelope<Record<string, unknown>>>("/v1/reports/modules").then(unwrap),
  },
  tenants: {
    list: () => api.get<ApiEnvelope<Record<string, unknown>[]> | Record<string, unknown>[]>("/v1/tenants").then(unwrap),
    provision: (body: unknown) => api.post<ApiEnvelope<Record<string, unknown>>>("/v1/tenants/provision", body, { idempotent: true }).then(unwrap),
  },
  pos: { sessions: () => api.get<ApiEnvelope<Record<string, unknown>[]> | Record<string, unknown>[]>("/v1/pos/sessions").then(unwrap) },
  production: { boms: () => api.get<ApiEnvelope<Record<string, unknown>[]> | Record<string, unknown>[]>("/v1/production/boms").then(unwrap) },
  hr: { employees: () => api.get<ApiEnvelope<Record<string, unknown>[]> | Record<string, unknown>[]>("/v1/hr/employees").then(unwrap) },
  pm: { projects: () => api.get<ApiEnvelope<Record<string, unknown>[]> | Record<string, unknown>[]>("/v1/pm/projects").then(unwrap) },
};
