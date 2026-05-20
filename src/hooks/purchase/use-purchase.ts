import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-errors";
import { purchaseApi } from "@/modules/purchase/purchase-api";
import type {
  CreateGrnInput,
  CreatePurchaseOrderInput,
  CreatePurchaseReturnInput,
  CreateSupplierInput,
  CreateVendorPaymentInput,
  UpdateSupplierInput,
} from "@/modules/purchase/types";

export const purchaseKeys = {
  all: ["purchase"] as const,
  suppliers: (params?: Record<string, unknown>) => [...purchaseKeys.all, "suppliers", params] as const,
  supplier: (id: number | string) => [...purchaseKeys.all, "supplier", id] as const,
  supplierLedger: (id: number | string, params?: Record<string, unknown>) =>
    [...purchaseKeys.all, "supplier-ledger", id, params] as const,
  orders: (params?: Record<string, unknown>) => [...purchaseKeys.all, "orders", params] as const,
  payments: (params?: Record<string, unknown>) => [...purchaseKeys.all, "payments", params] as const,
  grns: (params?: Record<string, unknown>) => [...purchaseKeys.all, "grns", params] as const,
  returns: (params?: Record<string, unknown>) => [...purchaseKeys.all, "returns", params] as const,
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

export function useCreatePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePurchaseOrderInput) => purchaseApi.createOrder(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: purchaseKeys.orders() });
      toast.success("Purchase order created");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to create purchase order")),
  });
}

export function useCancelPurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => purchaseApi.cancelOrder(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: purchaseKeys.orders() });
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
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: purchaseKeys.all });
      toast.success("Payment recorded");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to record payment")),
  });
}

export function usePurchaseGrns(params?: {
  page?: number;
  per_page?: number;
  supplier_id?: number;
}) {
  return useQuery({
    queryKey: purchaseKeys.grns(params),
    queryFn: () => purchaseApi.grns(params),
  });
}

export function useCreateGrn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateGrnInput) => purchaseApi.createGrn(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: purchaseKeys.all });
      toast.success("GRN posted — stock and AP updated");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to post GRN")),
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

export function useCreatePurchaseReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePurchaseReturnInput) => purchaseApi.createReturn(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: purchaseKeys.all });
      toast.success("Purchase return posted");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to post return")),
  });
}
