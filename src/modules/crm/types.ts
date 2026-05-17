import type { ApiEnvelope } from "@/services/api/types";

export type PaginatedResult<T> = {
  data: T[];
  pagination?: ApiEnvelope<T[]>["meta"]["pagination"];
};

export type CrmLeadDto = {
  id: number;
  uuid?: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company_name?: string | null;
  source?: string | null;
  status: string;
  customer_id?: number | null;
  notes?: string | null;
};

export type CrmCustomerDto = {
  id: number;
  uuid?: string;
  code?: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  balance: number;
  status: string;
};

export type CrmOrderLineDto = {
  id?: number;
  sku?: string | null;
  description?: string | null;
  quantity: number;
  quantity_fulfilled?: number;
  unit_price: number;
  unit_cost?: number;
  line_total: number;
};

export type CrmOrderDto = {
  id: number;
  number: string;
  customer_id?: number | null;
  quotation_id?: number | null;
  status: string;
  order_date?: string | null;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  lines?: CrmOrderLineDto[];
};

export type CrmInvoiceLineDto = {
  id?: number;
  sku?: string | null;
  description?: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

export type CrmInvoiceDto = {
  id: number;
  number: string;
  customer: string;
  customer_id?: number | null;
  crm_order_id?: number | null;
  status: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  paid: number;
  balance_due: number;
  issued?: string | null;
  due?: string | null;
  journal_entry_id?: number | null;
  lines?: CrmInvoiceLineDto[];
};

export type CrmPaymentDto = {
  id: number;
  number: string;
  invoice_id: number;
  customer_id?: number | null;
  amount: number;
  payment_date?: string | null;
  method?: string | null;
  journal_entry_id?: number | null;
};

export type CustomerLedgerEntryDto = {
  id: number;
  entry_date?: string | null;
  entry_type?: string | null;
  reference_type?: string | null;
  reference_id?: string | null;
  description?: string | null;
  debit: number;
  credit: number;
  balance_after: number;
};

export type CreateLeadInput = {
  name: string;
  email?: string;
  phone?: string;
  company_name?: string;
  source?: string;
  notes?: string;
};

export type CreateCustomerInput = {
  code?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_id?: string;
};

export type OrderLineInput = {
  sku: string;
  quantity: number;
  unit_price: number;
  unit_cost?: number;
};

export type CreateOrderInput = {
  customer_id?: number;
  quotation_id?: number;
  warehouse_id?: number;
  tax_amount?: number;
  lines: OrderLineInput[];
};

export type InvoiceLineInput = {
  description: string;
  quantity: number;
  unit_price: number;
  sku?: string;
};

export type CreateInvoiceInput = {
  customer_id?: number;
  customer?: string;
  crm_order_id?: number;
  tax_amount?: number;
  issued?: string;
  due?: string;
  lines?: InvoiceLineInput[];
};

export type CreatePaymentInput = {
  invoice_id: number;
  amount: number;
  payment_date?: string;
  method?: string;
};
