import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-errors";
import { showSideEffects } from "@/lib/api-meta";
import { saasApi } from "@/modules/saas/saas-api";
import type {
  CreateSaasPlanInput,
  ProvisionTenantInput,
  UpdateSaasPlanInput,
} from "@/modules/saas/types";

export const saasKeys = {
  all: ["saas"] as const,
  tenants: (params?: Record<string, unknown>) => ["saas", "tenants", params] as const,
  plans: (params?: Record<string, unknown>) => ["saas", "plans", params] as const,
  subscriptions: (params?: Record<string, unknown>) => ["saas", "subscriptions", params] as const,
  invoices: (tenantId: string, params?: Record<string, unknown>) =>
    ["saas", "invoices", tenantId, params] as const,
  usage: (tenantId: string) => ["saas", "usage", tenantId] as const,
};

function invalidateSaas(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: saasKeys.all });
}

export function useSaasTenants(params?: { per_page?: number }) {
  return useQuery({ queryKey: saasKeys.tenants(params), queryFn: () => saasApi.tenants(params) });
}

export function useSaasPlans(params?: { per_page?: number; is_active?: boolean }) {
  return useQuery({ queryKey: saasKeys.plans(params), queryFn: () => saasApi.plans(params) });
}

export function useSaasSubscriptions(params?: { per_page?: number; tenant_id?: string; status?: string }) {
  return useQuery({
    queryKey: saasKeys.subscriptions(params),
    queryFn: () => saasApi.subscriptions(params),
  });
}

export function useSaasInvoices(tenantId: string, params?: { per_page?: number }) {
  return useQuery({
    queryKey: saasKeys.invoices(tenantId, params),
    queryFn: () => saasApi.invoices({ tenant_id: tenantId, ...params }),
    enabled: Boolean(tenantId),
  });
}

export function useProvisionTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ProvisionTenantInput) => saasApi.provisionTenant(body),
    onSuccess: (res) => {
      invalidateSaas(qc);
      showSideEffects(res.meta);
      toast.success("Tenant provisioned");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to provision tenant")),
  });
}

export function useUpdateTenantStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number | string; status: string }) =>
      saasApi.updateTenantStatus(id, status),
    onSuccess: (res) => {
      invalidateSaas(qc);
      showSideEffects(res.meta);
      toast.success("Tenant status updated");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to update tenant")),
  });
}

export function useCreateSaasPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSaasPlanInput) => saasApi.createPlan(body),
    onSuccess: (res) => {
      invalidateSaas(qc);
      showSideEffects(res.meta);
      toast.success("Plan created");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to create plan")),
  });
}

export function useUpdateSaasPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number | string; body: UpdateSaasPlanInput }) =>
      saasApi.updatePlan(id, body),
    onSuccess: (res) => {
      invalidateSaas(qc);
      showSideEffects(res.meta);
      toast.success("Plan updated");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to update plan")),
  });
}

export function useAssignSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      tenant_id: string;
      plan_id: number;
      billing_cycle?: string;
      seats_allocated?: number;
      force_active?: boolean;
    }) => saasApi.assignSubscription(body),
    onSuccess: (res) => {
      invalidateSaas(qc);
      showSideEffects(res.meta);
      toast.success("Subscription assigned");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to assign subscription")),
  });
}

export function useChangeSubscriptionStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number | string; status: string }) =>
      saasApi.changeSubscriptionStatus(id, status),
    onSuccess: (res) => {
      invalidateSaas(qc);
      showSideEffects(res.meta);
      toast.success("Subscription updated");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to update subscription")),
  });
}

export function useIssueSaasInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { subscription_id: number; tax_rate?: number; due_days?: number }) =>
      saasApi.issueInvoice(body),
    onSuccess: (res) => {
      invalidateSaas(qc);
      showSideEffects(res.meta);
      toast.success("Invoice issued");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to issue invoice")),
  });
}

export function useMarkSaasInvoicePaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: number | string; amount?: number }) =>
      saasApi.markInvoicePaid(id, amount),
    onSuccess: (res) => {
      invalidateSaas(qc);
      showSideEffects(res.meta);
      toast.success("Payment recorded");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to record payment")),
  });
}
