import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-errors";
import { posApi } from "@/modules/pos/pos-api";
import type { CheckoutInput, CreateCartLineInput } from "@/modules/pos/types";

const RECENT_POS_ERROR_TOASTS = new Map<string, number>();
const POS_ERROR_TOAST_COOLDOWN_MS = 8000;

function showPosErrorToast(error: unknown, fallback: string) {
  const message = getApiErrorMessage(error, fallback);
  const normalized =
    message.toLowerCase().includes("request timeout after") ||
    message.toLowerCase().includes("request aborted")
      ? "pos-network-timeout"
      : message;
  const now = Date.now();
  const lastShown = RECENT_POS_ERROR_TOASTS.get(normalized) ?? 0;
  if (now - lastShown < POS_ERROR_TOAST_COOLDOWN_MS) return;
  RECENT_POS_ERROR_TOASTS.set(normalized, now);
  toast.error(message);
}

export const posKeys = {
  all: ["pos"] as const,
  cart: (id: number | string) => ["pos", "cart", id] as const,
  sale: (id: number | string) => ["pos", "sale", id] as const,
  sales: ["pos", "sales"] as const,
};

export function usePosCart(cartId: number | null | undefined) {
  return useQuery({
    queryKey: posKeys.cart(cartId ?? ""),
    queryFn: () => posApi.getCart(cartId!),
    enabled: Boolean(cartId),
  });
}

export function usePosSale(saleId: number | null | undefined) {
  return useQuery({
    queryKey: posKeys.sale(saleId ?? ""),
    queryFn: () => posApi.sale(saleId!),
    enabled: Boolean(saleId),
  });
}

export function useCreatePosCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: posApi.createCart,
    onSuccess: (cart) => {
      qc.setQueryData(posKeys.cart(cart.id), cart);
    },
    onError: (e) => showPosErrorToast(e, "Failed to open cart"),
  });
}

type CartScopedLineInput = {
  cartId: number;
  body: CreateCartLineInput;
};

type CartScopedUpdateInput = {
  cartId: number;
  lineId: number;
  body: CreateCartLineInput;
};

type CartScopedRemoveInput = {
  cartId: number;
  lineId: number;
};

type CartScopedDiscountInput = {
  cartId: number;
  body: { discount_amount?: number; discount_percent?: number; tax_amount?: number };
};

type CartScopedCheckoutInput = {
  cartId: number;
  body: CheckoutInput;
};

export function useAddCartLine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cartId, body }: CartScopedLineInput) => posApi.addCartLine(cartId, body),
    onSuccess: (cart, { cartId }) => {
      qc.setQueryData(posKeys.cart(cartId), cart);
    },
    onError: (e) => showPosErrorToast(e, "Failed to add item"),
  });
}

export function useUpdateCartLine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cartId, lineId, body }: CartScopedUpdateInput) =>
      posApi.updateCartLine(cartId, lineId, body),
    onSuccess: (cart, { cartId }) => {
      qc.setQueryData(posKeys.cart(cartId), cart);
    },
    onError: (e) => showPosErrorToast(e, "Failed to update line"),
  });
}

export function useRemoveCartLine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cartId, lineId }: CartScopedRemoveInput) => posApi.removeCartLine(cartId, lineId),
    onSuccess: (cart, { cartId }) => {
      qc.setQueryData(posKeys.cart(cartId), cart);
    },
    onError: (e) => showPosErrorToast(e, "Failed to remove line"),
  });
}

export function useApplyCartDiscount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cartId, body }: CartScopedDiscountInput) =>
      posApi.applyCartDiscount(cartId, body),
    onSuccess: (cart, { cartId }) => {
      qc.setQueryData(posKeys.cart(cartId), cart);
    },
    onError: (e) => showPosErrorToast(e, "Failed to update totals"),
  });
}

export function usePosCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cartId, body }: CartScopedCheckoutInput) => posApi.checkout(cartId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: posKeys.all });
    },
    onError: (e) => showPosErrorToast(e, "Checkout failed"),
  });
}

export function usePosSales(params?: { per_page?: number }) {
  return useQuery({
    queryKey: [...posKeys.sales, params] as const,
    queryFn: () => posApi.sales(params),
  });
}

export function usePosReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: posApi.postReturn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: posKeys.all });
      toast.success("Return processed");
    },
    onError: (e) => showPosErrorToast(e, "Return failed"),
  });
}
