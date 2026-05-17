import type { ApiEnvelope } from "@/services/api/types";

export type PaginatedResult<T> = {
  data: T[];
  pagination?: ApiEnvelope<T[]>["meta"]["pagination"];
};

export type PosCartLineDto = {
  id: number;
  sku: string;
  description: string;
  quantity: number;
  unit_price: number;
  unit_cost?: number;
  discount_amount: number;
  discount_percent: number;
  line_total: number;
};

export type PosCartDto = {
  id: number;
  session_id?: number | null;
  customer_id?: number | null;
  warehouse_id?: number | null;
  status: string;
  discount_amount: number;
  discount_percent: number;
  tax_amount: number;
  subtotal: number;
  total_amount: number;
  lines?: PosCartLineDto[];
};

export type PosSalePaymentDto = {
  id: number;
  method: string;
  account_code?: string | null;
  amount: number;
  reference?: string | null;
};

export type PosSaleLineDto = {
  id: number;
  sku: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  line_total: number;
};

export type PosSaleDto = {
  id: number;
  number: string;
  session_id?: number | null;
  cart_id?: number | null;
  customer_id?: number | null;
  status: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  amount_paid: number;
  change_given: number;
  sale_date?: string | null;
  lines?: PosSaleLineDto[];
  payments?: PosSalePaymentDto[];
};

export type PosReturnDto = {
  id: number;
  number: string;
  sale_id: number;
  status: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  return_date?: string | null;
  reason?: string | null;
};

export type PosReceiptDto = {
  type: "sale" | "return";
  receipt_number: string;
  sale_id?: number;
  return_id?: number;
  sale_date?: string | null;
  return_date?: string | null;
  customer?: string;
  original_sale?: string;
  lines: Array<{
    sku?: string;
    description?: string;
    quantity: number;
    unit_price?: number;
    discount_amount?: number;
    line_total: number;
  }>;
  payments?: Array<{ method: string; amount: number; reference?: string | null }>;
  subtotal: number;
  discount_amount?: number;
  tax_amount: number;
  total_amount: number;
  amount_paid?: number;
  change_given?: number;
  reason?: string | null;
  printed_at?: string;
};

export type PaymentInput = {
  method: "cash" | "card" | "bank" | "mobile" | "account";
  amount: number;
  reference?: string;
};

export type CheckoutInput = {
  payments: PaymentInput[];
  notes?: string;
};

export type CreateCartLineInput = {
  sku: string;
  quantity: number;
  unit_price?: number;
  unit_cost?: number;
  description?: string;
  discount_amount?: number;
  discount_percent?: number;
};

export type OfflineCheckoutJob = {
  id: string;
  cartId: number;
  payload: CheckoutInput;
  createdAt: string;
  retries: number;
};
