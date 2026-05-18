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

export type CrmContactDto = {
  id: number;
  uuid?: string;
  first_name: string;
  last_name?: string | null;
  name: string;
  job_title?: string | null;
  title?: string | null;
  customer_id?: number | null;
  company_name?: string | null;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  tags: string[];
  status: string;
  is_primary: boolean;
  notes?: string | null;
};

export type CreateContactInput = {
  first_name: string;
  last_name?: string;
  job_title?: string;
  customer_id?: number;
  company_name?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  status?: string;
  is_primary?: boolean;
  notes?: string;
};

export type UpdateContactInput = Partial<CreateContactInput>;

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

export type CrmAnalyticsFilters = {
  from?: string;
  to?: string;
  top_limit?: number;
};

export type CrmAnalyticsChartPoint = { name: string; value: number };

export type CrmAnalyticsRevenuePoint = { month: string; revenue: number; invoices: number };

export type CrmAnalyticsTopInvoice = {
  id: number;
  number: string;
  customer: string;
  total_amount: number;
  status: string;
};

export type CrmAnalyticsDto = {
  range: { from: string; to: string } | null;
  summary: {
    revenue: number;
    collected: number;
    open_ar: number;
    open_leads: number;
    fulfilled_orders: number;
    invoice_count: number;
    order_count: number;
  };
  revenue_trend: CrmAnalyticsRevenuePoint[];
  leads_by_status: CrmAnalyticsChartPoint[];
  orders_by_status: CrmAnalyticsChartPoint[];
  invoices_by_status: CrmAnalyticsChartPoint[];
  top_invoices: CrmAnalyticsTopInvoice[];
};
