import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-errors";
import { showSideEffects } from "@/lib/api-meta";
import { crmApi } from "@/modules/crm/crm-api";
import type {
  CreateCustomerInput,
  CreateInvoiceInput,
  CreateLeadInput,
  CreateOrderInput,
  CreatePaymentInput,
} from "@/modules/crm/types";

export const crmKeys = {
  all: ["crm"] as const,
  leads: (params?: Record<string, unknown>) => ["crm", "leads", params] as const,
  customers: (params?: Record<string, unknown>) => ["crm", "customers", params] as const,
  customer: (id: string | number) => ["crm", "customers", id] as const,
  ledger: (id: string | number) => ["crm", "customers", id, "ledger"] as const,
  orders: (params?: Record<string, unknown>) => ["crm", "orders", params] as const,
  invoices: (params?: Record<string, unknown>) => ["crm", "invoices", params] as const,
  payments: (params?: Record<string, unknown>) => ["crm", "payments", params] as const,
};

export function useCrmLeads(params?: { per_page?: number; status?: string; search?: string }) {
  return useQuery({ queryKey: crmKeys.leads(params), queryFn: () => crmApi.leads(params) });
}

export function useCrmCustomers(params?: { per_page?: number; search?: string }) {
  return useQuery({ queryKey: crmKeys.customers(params), queryFn: () => crmApi.customers(params) });
}

export function useCrmCustomer(id: string | number | undefined) {
  return useQuery({
    queryKey: crmKeys.customer(id ?? ""),
    queryFn: () => crmApi.customer(id!),
    enabled: Boolean(id),
  });
}

export function useCustomerLedger(id: string | number | undefined) {
  return useQuery({
    queryKey: crmKeys.ledger(id ?? ""),
    queryFn: () => crmApi.customerLedger(id!, { per_page: 50 }),
    enabled: Boolean(id),
  });
}

export function useCrmOrders(params?: { per_page?: number; status?: string }) {
  return useQuery({ queryKey: crmKeys.orders(params), queryFn: () => crmApi.orders(params) });
}

export function useCrmInvoices(params?: { per_page?: number; status?: string; customer_id?: string }) {
  return useQuery({ queryKey: crmKeys.invoices(params), queryFn: () => crmApi.invoices(params) });
}

export function useCrmPayments(params?: { per_page?: number; customer_id?: string }) {
  return useQuery({ queryKey: crmKeys.payments(params), queryFn: () => crmApi.payments(params) });
}

function invalidateCrm(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: crmKeys.all });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateLeadInput) => crmApi.createLead(body),
    onSuccess: () => {
      invalidateCrm(qc);
      toast.success("Lead created");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to create lead")),
  });
}

export function useConvertLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => crmApi.convertLead(id),
    onSuccess: () => {
      invalidateCrm(qc);
      toast.success("Lead converted to customer");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to convert lead")),
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCustomerInput) => crmApi.createCustomer(body),
    onSuccess: () => {
      invalidateCrm(qc);
      toast.success("Customer created");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to create customer")),
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateOrderInput) => crmApi.createOrder(body),
    onSuccess: () => {
      invalidateCrm(qc);
      toast.success("Sales order created");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to create order")),
  });
}

export function useFulfillOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => crmApi.fulfillOrder(id),
    onSuccess: (res) => {
      invalidateCrm(qc);
      qc.invalidateQueries({ queryKey: ["inventory"] });
      showSideEffects(res.meta);
      toast.success("Order fulfilled — stock updated");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to fulfill order")),
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateInvoiceInput) => crmApi.createInvoice(body),
    onSuccess: (res) => {
      invalidateCrm(qc);
      showSideEffects(res.meta);
      toast.success("Invoice issued");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to issue invoice")),
  });
}

export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePaymentInput) => crmApi.createPayment(body),
    onSuccess: (res) => {
      invalidateCrm(qc);
      showSideEffects(res.meta);
      toast.success("Payment recorded");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to record payment")),
  });
}
