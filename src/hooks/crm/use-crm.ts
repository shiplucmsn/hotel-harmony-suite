import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-errors";
import { showSideEffects } from "@/lib/api-meta";
import { crmApi } from "@/modules/crm/crm-api";
import type {
  CreateContactInput,
  CreateCustomerInput,
  UpdateContactInput,
  CreateDealInput,
  UpdateDealInput,
  CreateInvoiceInput,
  CreateLeadInput,
  CreateOrderInput,
  CreateQuotationInput,
  UpdateQuotationInput,
  CreatePaymentInput,
  CrmAnalyticsFilters,
} from "@/modules/crm/types";

export const crmKeys = {
  all: ["crm"] as const,
  analytics: (params?: CrmAnalyticsFilters) => ["crm", "analytics", params] as const,
  leads: (params?: Record<string, unknown>) => ["crm", "leads", params] as const,
  contacts: (params?: Record<string, unknown>) => ["crm", "contacts", params] as const,
  contact: (id: string | number) => ["crm", "contacts", id] as const,
  pipeline: (params?: Record<string, unknown>) => ["crm", "pipeline", params] as const,
  deals: (params?: Record<string, unknown>) => ["crm", "deals", params] as const,
  deal: (id: string | number) => ["crm", "deals", id] as const,
  customers: (params?: Record<string, unknown>) => ["crm", "customers", params] as const,
  customer: (id: string | number) => ["crm", "customers", id] as const,
  ledger: (id: string | number, params?: Record<string, unknown>) =>
    ["crm", "customers", id, "ledger", params] as const,
  orders: (params?: Record<string, unknown>) => ["crm", "orders", params] as const,
  quotations: (params?: Record<string, unknown>) => ["crm", "quotations", params] as const,
  quotation: (id: string | number) => ["crm", "quotations", id] as const,
  invoices: (params?: Record<string, unknown>) => ["crm", "invoices", params] as const,
  payments: (params?: Record<string, unknown>) => ["crm", "payments", params] as const,
};

export function useCrmAnalytics(params?: CrmAnalyticsFilters) {
  return useQuery({
    queryKey: crmKeys.analytics(params),
    queryFn: () => crmApi.analytics(params),
  });
}

export function useCrmLeads(params?: { per_page?: number; status?: string; search?: string }) {
  return useQuery({ queryKey: crmKeys.leads(params), queryFn: () => crmApi.leads(params) });
}

export function useCrmContacts(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  customer_id?: string | number;
}) {
  return useQuery({ queryKey: crmKeys.contacts(params), queryFn: () => crmApi.contacts(params) });
}

export function useCrmContact(id: string | number | undefined) {
  return useQuery({
    queryKey: crmKeys.contact(id ?? ""),
    queryFn: () => crmApi.contact(id!),
    enabled: Boolean(id),
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateContactInput) => crmApi.createContact(body),
    onSuccess: () => {
      invalidateCrm(qc);
      toast.success("Contact created");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to create contact")),
  });
}

export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number | string; body: UpdateContactInput }) =>
      crmApi.updateContact(id, body),
    onSuccess: () => {
      invalidateCrm(qc);
      toast.success("Contact updated");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to update contact")),
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => crmApi.deleteContact(id),
    onSuccess: () => {
      invalidateCrm(qc);
      toast.success("Contact deleted");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to delete contact")),
  });
}

export function useCrmPipeline(params?: { search?: string }) {
  return useQuery({
    queryKey: crmKeys.pipeline(params),
    queryFn: () => crmApi.pipeline(params),
  });
}

export function useCreateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateDealInput) => crmApi.createDeal(body),
    onSuccess: () => {
      invalidateCrm(qc);
      toast.success("Deal created");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to create deal")),
  });
}

export function useUpdateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number | string; body: UpdateDealInput }) =>
      crmApi.updateDeal(id, body),
    onSuccess: () => {
      invalidateCrm(qc);
      toast.success("Deal updated");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to update deal")),
  });
}

export function useDeleteDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => crmApi.deleteDeal(id),
    onSuccess: () => {
      invalidateCrm(qc);
      toast.success("Deal deleted");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to delete deal")),
  });
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

export function useCustomerLedger(
  id: string | number | undefined,
  params?: { from?: string; to?: string; page?: number; per_page?: number },
) {
  return useQuery({
    queryKey: crmKeys.ledger(id ?? "", params),
    queryFn: () => crmApi.customerLedger(id!, { per_page: 50, ...params }),
    enabled: Boolean(id),
  });
}

export function useCrmOrders(params?: {
  page?: number;
  per_page?: number;
  status?: string;
  search?: string;
}) {
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

export function useMoveLeadPipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stage }: { id: number | string; stage: string }) =>
      crmApi.moveLeadPipeline(id, stage),
    onSuccess: () => {
      invalidateCrm(qc);
      toast.success("Lead moved");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to move lead")),
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

export function useCrmQuotations(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
}) {
  return useQuery({ queryKey: crmKeys.quotations(params), queryFn: () => crmApi.quotations(params) });
}

export function useCrmQuotation(id: string | number | undefined) {
  return useQuery({
    queryKey: crmKeys.quotation(id ?? ""),
    queryFn: () => crmApi.quotation(id!),
    enabled: Boolean(id),
  });
}

function quotationWasEmailed(meta?: { sideEffects?: { action: string }[] }) {
  return meta?.sideEffects?.some((s) => s.action === "emailed") ?? false;
}

export function useCreateQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateQuotationInput) => crmApi.createQuotation(body),
    onSuccess: (res) => {
      invalidateCrm(qc);
      toast.success(
        quotationWasEmailed(res.meta)
          ? "Quote sent to customer email"
          : "Quotation saved as draft",
      );
      showSideEffects(res.meta);
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to create quotation")),
  });
}

export function useUpdateQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number | string; body: UpdateQuotationInput }) =>
      crmApi.updateQuotation(id, body),
    onSuccess: (res, { body }) => {
      invalidateCrm(qc);
      if (quotationWasEmailed(res.meta)) {
        toast.success("Quote sent to customer email");
      } else if (body.status === "sent") {
        toast.success("Quotation marked as sent");
      } else {
        toast.success("Quotation updated");
      }
      showSideEffects(res.meta);
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to update quotation")),
  });
}

export function useDeleteQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => crmApi.deleteQuotation(id),
    onSuccess: () => {
      invalidateCrm(qc);
      toast.success("Quotation deleted");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to delete quotation")),
  });
}

export function useConvertQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => crmApi.convertQuotation(id),
    onSuccess: (res) => {
      invalidateCrm(qc);
      showSideEffects(res.meta);
      toast.success("Quotation converted to sales order");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to convert quotation")),
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
      toast.success("Stock updated. Issue an invoice to record revenue.");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to fulfill order")),
  });
}

export function useConfirmOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => crmApi.confirmOrder(id),
    onSuccess: (res) => {
      invalidateCrm(qc);
      qc.invalidateQueries({ queryKey: ["inventory"] });
      showSideEffects(res.meta);
      toast.success("Order confirmed — stock reserved");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to confirm order")),
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => crmApi.cancelOrder(id),
    onSuccess: (res) => {
      invalidateCrm(qc);
      qc.invalidateQueries({ queryKey: ["inventory"] });
      showSideEffects(res.meta);
      toast.success("Order cancelled");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to cancel order")),
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
