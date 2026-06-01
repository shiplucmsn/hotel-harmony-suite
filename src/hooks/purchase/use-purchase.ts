import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-errors";
import { showSideEffects } from "@/lib/api-meta";
import { purchaseApi } from "@/modules/purchase/purchase-api";
import type {
  CreateGrnInput,
  CreatePurchaseOrderInput,
  CreatePurchaseReturnInput,
  CreateSupplierInput,
  CreateSupplierInvoiceInput,
  CreateVendorPaymentInput,
  UpdatePurchaseOrderInput,
  UpdateSupplierInput,
} from "@/modules/purchase/types";

export const purchaseKeys = {
  all: ["purchase"] as const,
  suppliers: (params?: Record<string, unknown>) => [...purchaseKeys.all, "suppliers", params] as const,
  supplier: (id: number | string) => [...purchaseKeys.all, "supplier", id] as const,
  supplierLedger: (id: number | string, params?: Record<string, unknown>) =>
    [...purchaseKeys.all, "supplier-ledger", id, params] as const,
  orders: (params?: Record<string, unknown>) => [...purchaseKeys.all, "orders", params] as const,
  /** Prefix for invalidating every orders list query (any page/tab/filter). */
  ordersList: () => [...purchaseKeys.all, "orders"] as const,
  order: (id: number | string) => [...purchaseKeys.all, "order", id] as const,
  orderActivity: (id: number | string) => [...purchaseKeys.all, "order-activity", id] as const,
  payments: (params?: Record<string, unknown>) => [...purchaseKeys.all, "payments", params] as const,
  grns: (params?: Record<string, unknown>) => [...purchaseKeys.all, "grns", params] as const,
  grn: (id: number | string) => [...purchaseKeys.all, "grn", id] as const,
  grnQcQueue: (params?: Record<string, unknown>) => [...purchaseKeys.all, "grn-qc-queue", params] as const,
  returns: (params?: Record<string, unknown>) => [...purchaseKeys.all, "returns", params] as const,
  supplierInvoices: (params?: Record<string, unknown>) =>
    [...purchaseKeys.all, "supplier-invoices", params] as const,
  supplierInvoice: (id: number | string) => [...purchaseKeys.all, "supplier-invoice", id] as const,
};

export function useSuppliers(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: purchaseKeys.suppliers(params),
    queryFn: () => purchaseApi.suppliers(params),
  });
}

export function useSupplier(id: number | string | null | undefined) {
  return useQuery({
    queryKey: purchaseKeys.supplier(id ?? ""),
    queryFn: () => purchaseApi.supplier(id!),
    enabled: id != null && id !== "",
  });
}

export function useSupplierLedger(
  id: number | string | null | undefined,
  params?: { page?: number; per_page?: number },
) {
  return useQuery({
    queryKey: purchaseKeys.supplierLedger(id ?? "", params),
    queryFn: () => purchaseApi.supplierLedger(id!, params),
    enabled: id != null && id !== "",
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSupplierInput) => purchaseApi.createSupplier(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: purchaseKeys.all });
      toast.success("Supplier created");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to create supplier")),
  });
}

export function useUpdateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number | string; body: UpdateSupplierInput }) =>
      purchaseApi.updateSupplier(id, body),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: purchaseKeys.all });
      void qc.invalidateQueries({ queryKey: purchaseKeys.supplier(vars.id) });
      toast.success("Supplier updated");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to update supplier")),
  });
}

export function usePurchaseOpenSummary() {
  return useQuery({
    queryKey: [...purchaseKeys.all, "open-summary"] as const,
    queryFn: () => purchaseApi.openOrdersSummary(),
  });
}

export function usePurchaseApSummary() {
  return useQuery({
    queryKey: [...purchaseKeys.all, "ap-summary"] as const,
    queryFn: () => purchaseApi.apSummary(),
  });
}

export function usePurchaseOrders(params?: {
  page?: number;
  per_page?: number;
  status?: string;
  supplier_id?: number;
}) {
  return useQuery({
    queryKey: purchaseKeys.orders(params),
    queryFn: () => purchaseApi.orders(params),
  });
}

export function usePurchaseOrder(id: number | string | null | undefined) {
  return useQuery({
    queryKey: purchaseKeys.order(id ?? ""),
    queryFn: () => purchaseApi.order(id!),
    enabled: id != null && id !== "",
  });
}

export function usePurchaseOrderActivity(id: number | string | null | undefined) {
  return useQuery({
    queryKey: purchaseKeys.orderActivity(id ?? ""),
    queryFn: () => purchaseApi.orderActivity(id!),
    enabled: id != null && id !== "",
  });
}

export function useCreatePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePurchaseOrderInput) => purchaseApi.createOrder(body),
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: purchaseKeys.ordersList() });
      showSideEffects(res.meta);
      toast.success("Purchase order created");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to create purchase order")),
  });
}

export function useUpdatePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number | string; body: UpdatePurchaseOrderInput }) =>
      purchaseApi.updateOrder(id, body),
    onSuccess: (res, vars) => {
      void qc.invalidateQueries({ queryKey: purchaseKeys.ordersList() });
      void qc.invalidateQueries({ queryKey: purchaseKeys.order(vars.id) });
      showSideEffects(res.meta);
      toast.success("Purchase order updated");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to update purchase order")),
  });
}

export function useSubmitPurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      requires_approval,
    }: {
      id: number | string;
      requires_approval?: boolean;
    }) => purchaseApi.submitOrder(id, { requires_approval }),
    onSuccess: (res, vars) => {
      void qc.invalidateQueries({ queryKey: purchaseKeys.ordersList() });
      void qc.invalidateQueries({ queryKey: purchaseKeys.order(vars.id) });
      showSideEffects(res.meta);
      toast.success("Purchase order submitted");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to submit purchase order")),
  });
}

export function useApprovePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => purchaseApi.approveOrder(id),
    onSuccess: (res, id) => {
      void qc.invalidateQueries({ queryKey: purchaseKeys.ordersList() });
      void qc.invalidateQueries({ queryKey: purchaseKeys.order(id) });
      showSideEffects(res.meta);
      toast.success("Purchase order approved");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to approve order")),
  });
}

export function useCancelPurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => purchaseApi.cancelOrder(id),
    onSuccess: (res, id) => {
      void qc.invalidateQueries({ queryKey: purchaseKeys.ordersList() });
      void qc.invalidateQueries({ queryKey: purchaseKeys.order(id) });
      showSideEffects(res.meta);
      toast.success("Purchase order cancelled");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to cancel order")),
  });
}

export function useVendorPayments(params?: { page?: number; per_page?: number; supplier_id?: number }) {
  return useQuery({
    queryKey: purchaseKeys.payments(params),
    queryFn: () => purchaseApi.payments(params),
  });
}

export function useCreateVendorPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateVendorPaymentInput) => purchaseApi.createPayment(body),
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: purchaseKeys.all });
      showSideEffects(res.meta);
      toast.success("Payment recorded");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to record payment")),
  });
}

export function usePurchaseGrns(
  params?: {
    page?: number;
    per_page?: number;
    supplier_id?: number;
    purchase_order_id?: number;
    status?: string;
    qc_status?: string;
    uninvoiced?: boolean;
    invoiceable?: boolean;
  },
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: purchaseKeys.grns(params),
    queryFn: () => purchaseApi.grns(params),
    enabled: options?.enabled ?? true,
  });
}

export function usePurchaseGrn(id: number | string | null | undefined) {
  return useQuery({
    queryKey: purchaseKeys.grn(id ?? ""),
    queryFn: () => purchaseApi.grn(id!),
    enabled: id != null && id !== "",
  });
}

export function useCreateGrn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateGrnInput) => purchaseApi.createGrn(body),
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: purchaseKeys.all });
      showSideEffects(res.meta);
      toast.success("GRN posted");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to post GRN")),
  });
}

export function useGrnQcQueue(params?: { page?: number; per_page?: number; supplier_id?: number }) {
  return useQuery({
    queryKey: purchaseKeys.grnQcQueue(params),
    queryFn: () => purchaseApi.grnQcQueue(params),
  });
}

export function useQcAcceptGrn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => purchaseApi.qcAcceptGrn(id),
    onSuccess: (res, id) => {
      void qc.invalidateQueries({ queryKey: purchaseKeys.all });
      void qc.invalidateQueries({ queryKey: purchaseKeys.grn(id) });
      showSideEffects(res.meta);
      toast.success("QC accepted — stock moved to sellable");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "QC accept failed")),
  });
}

export function useQcRejectGrn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number | string;
      body?: { create_return?: boolean; notes?: string };
    }) => purchaseApi.qcRejectGrn(id, body),
    onSuccess: (res, vars) => {
      void qc.invalidateQueries({ queryKey: purchaseKeys.all });
      void qc.invalidateQueries({ queryKey: purchaseKeys.grn(vars.id) });
      showSideEffects(res.meta);
      toast.success("QC rejected");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "QC reject failed")),
  });
}

export function useVoidGrn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => purchaseApi.voidGrn(id),
    onSuccess: (res, id) => {
      void qc.invalidateQueries({ queryKey: purchaseKeys.all });
      void qc.invalidateQueries({ queryKey: purchaseKeys.grn(id) });
      showSideEffects(res.meta);
      toast.success("GRN voided");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to void GRN")),
  });
}

export function usePurchaseReturns(params?: {
  page?: number;
  per_page?: number;
  supplier_id?: number;
}) {
  return useQuery({
    queryKey: purchaseKeys.returns(params),
    queryFn: () => purchaseApi.returns(params),
  });
}

export function useSupplierInvoices(params?: {
  page?: number;
  per_page?: number;
  supplier_id?: number;
  status?: string;
  search?: string;
  purchase_order_id?: number;
}) {
  return useQuery({
    queryKey: purchaseKeys.supplierInvoices(params),
    queryFn: () => purchaseApi.supplierInvoices(params),
  });
}

export function useSupplierInvoice(id: number | string | null | undefined) {
  return useQuery({
    queryKey: purchaseKeys.supplierInvoice(id ?? ""),
    queryFn: () => purchaseApi.supplierInvoice(id!),
    enabled: id != null && id !== "",
  });
}

export function useCreateSupplierInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSupplierInvoiceInput) => purchaseApi.createSupplierInvoice(body),
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: purchaseKeys.all });
      showSideEffects(res.meta);
      toast.success("Supplier invoice created");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to create invoice")),
  });
}

export function useMatchSupplierInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, force }: { id: number | string; force?: boolean }) =>
      purchaseApi.matchSupplierInvoice(id, { force }),
    onSuccess: (res, vars) => {
      void qc.invalidateQueries({ queryKey: purchaseKeys.all });
      void qc.invalidateQueries({ queryKey: purchaseKeys.supplierInvoice(vars.id) });
      showSideEffects(res.meta);
      toast.success("3-way match completed");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Match failed")),
  });
}

export function useApproveSupplierInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => purchaseApi.approveSupplierInvoice(id),
    onSuccess: (res, id) => {
      void qc.invalidateQueries({ queryKey: purchaseKeys.all });
      void qc.invalidateQueries({ queryKey: purchaseKeys.supplierInvoice(id) });
      showSideEffects(res.meta);
      toast.success("Invoice approved");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Approval failed")),
  });
}

export function useCreatePurchaseReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePurchaseReturnInput) => purchaseApi.createReturn(body),
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: purchaseKeys.all });
      showSideEffects(res.meta);
      toast.success("Purchase return posted");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to post return")),
  });
}
