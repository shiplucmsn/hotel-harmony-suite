export type PaginationDto = {
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
};

export type PaginatedResult<T> = {
  data: T[];
  pagination?: PaginationDto;
};

export type SupplierDto = {
  id: number;
  uuid?: string;
  code: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  payment_terms?: string | null;
  balance: number;
  status: string;
  created_at?: string;
};

export type CreateSupplierInput = {
  code?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  payment_terms?: string;
  status?: "active" | "inactive";
};

export type UpdateSupplierInput = Partial<CreateSupplierInput>;

export type VendorLedgerEntryDto = {
  id: number;
  entry_date?: string;
  entry_type?: string;
  reference_type?: string;
  reference_id?: string;
  description?: string;
  debit: number;
  credit: number;
  balance_after: number;
};

export type PurchaseOrderLineDto = {
  id?: number;
  sku: string;
  description?: string | null;
  quantity_ordered?: number;
  quantity_received?: number;
  unit_cost: number;
  tax_code?: string | null;
  tax_amount?: number;
  line_total?: number;
};

export type PurchaseOrderDto = {
  id: number;
  uuid?: string;
  number: string;
  supplier: string;
  supplier_id?: number | null;
  warehouse_id?: number | null;
  status: string;
  order_date?: string;
  expected_date?: string | null;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency_code?: string;
  exchange_rate?: number;
  base_currency_code?: string;
  notes?: string | null;
  lines?: PurchaseOrderLineDto[];
  created_at?: string;
};

export type PurchaseOpenSummaryDto = {
  open_order_count: number;
  pending_receive_line_count: number;
  pending_receive_value: number;
  awaiting_receive_count: number;
  by_status: Record<string, number>;
};

export type PurchaseApSummaryDto = {
  total_outstanding: number;
  supplier_count: number;
  aging: {
    current_0_30: number;
    days_31_60: number;
    days_61_plus: number;
  };
  note?: string;
  top_suppliers: { id: number; code: string; name: string; balance: number }[];
};

export type LandedCostInput = {
  cost_type?: "freight" | "duty" | "insurance" | "other";
  amount: number;
  allocation_method?: "qty" | "value";
  description?: string;
};

export type CreateGrnInput = {
  purchase_order_id?: number;
  supplier_id?: number;
  warehouse_id?: number;
  received_date?: string;
  number?: string;
  notes?: string;
  tax_amount?: number;
  currency_code?: string;
  exchange_rate?: number;
  sku?: string;
  quantity?: number;
  unit_cost?: number;
  batch_number?: string;
  expiry_date?: string;
  lines?: {
    sku: string;
    quantity: number;
    unit_cost: number;
    tax_code?: string;
    tax_amount?: number;
    batch_number?: string;
    expiry_date?: string;
  }[];
  landed_costs?: LandedCostInput[];
  update_product_cost?: boolean;
  requires_qc?: boolean;
};

export type CreatePurchaseOrderInput = {
  supplier_id?: number;
  supplier?: string;
  warehouse_id?: number;
  order_date?: string;
  expected_date?: string;
  tax_amount?: number;
  currency_code?: string;
  exchange_rate?: number;
  notes?: string;
  status?: "draft" | "pending" | "pending_approval";
  requires_approval?: boolean;
  lines?: {
    sku: string;
    quantity: number;
    unit_cost: number;
    description?: string;
    tax_code?: string;
  }[];
};

export type UpdatePurchaseOrderInput = {
  supplier_id?: number;
  warehouse_id?: number | null;
  order_date?: string;
  expected_date?: string | null;
  tax_amount?: number;
  currency_code?: string;
  exchange_rate?: number;
  notes?: string | null;
  lines?: {
    sku: string;
    quantity: number;
    unit_cost: number;
    description?: string;
    tax_code?: string;
  }[];
};

export type VendorPaymentDto = {
  id: number;
  uuid?: string;
  number: string;
  supplier_id: number;
  amount: number;
  payment_date?: string;
  method?: string | null;
  reference?: string | null;
  status: string;
  notes?: string | null;
  supplier?: SupplierDto;
  created_at?: string;
};

export type CreateVendorPaymentInput = {
  supplier_id: number;
  supplier_invoice_id?: number;
  amount: number;
  payment_date?: string;
  method?: string;
  reference?: string;
  notes?: string;
};

export type SupplierInvoiceLineDto = {
  id?: number;
  sku: string;
  description?: string | null;
  quantity: number;
  unit_cost: number;
  line_total: number;
  purchase_grn_line_id?: number | null;
  po_quantity?: number | null;
  po_unit_cost?: number | null;
  grn_quantity?: number | null;
  grn_unit_cost?: number | null;
};

export type SupplierInvoiceDto = {
  id: number;
  uuid?: string;
  number: string;
  vendor_invoice_number?: string | null;
  supplier_id: number;
  purchase_order_id?: number | null;
  invoice_date?: string;
  due_date?: string | null;
  status: string;
  match_status?: string | null;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  match_result?: { matched?: boolean; variances?: unknown[] } | null;
  notes?: string | null;
  supplier?: SupplierDto;
  lines?: SupplierInvoiceLineDto[];
  grn_ids?: number[];
  created_at?: string;
};

export type CreateSupplierInvoiceInput = {
  supplier_id?: number;
  purchase_order_id?: number;
  purchase_grn_id?: number;
  purchase_grn_ids?: number[];
  vendor_invoice_number?: string;
  invoice_date?: string;
  due_date?: string;
  tax_amount?: number;
  notes?: string;
  lines?: { sku: string; quantity: number; unit_cost: number; purchase_grn_line_id?: number }[];
};

export type PurchaseLandedCostDto = {
  id?: number;
  cost_type: string;
  allocation_method: string;
  amount: number;
  description?: string | null;
};

export type PurchaseGrnLineDto = {
  id?: number;
  sku: string;
  quantity: number;
  unit_cost: number;
  tax_code?: string | null;
  tax_amount?: number;
  foreign_unit_cost?: number | null;
  foreign_line_total?: number | null;
  line_total?: number;
  batch_number?: string | null;
  expiry_date?: string | null;
  inventory_batch_id?: number | null;
};

export type PurchaseGrnDto = {
  id: number;
  uuid?: string;
  number: string;
  purchase_order_id?: number | null;
  supplier_id?: number | null;
  warehouse_id?: number | null;
  quarantine_warehouse_id?: number | null;
  status: string;
  qc_status?: string;
  sku?: string;
  quantity?: number;
  unit_cost?: number;
  subtotal?: number;
  tax_amount?: number;
  total_amount: number;
  amount?: number;
  currency_code?: string;
  exchange_rate?: number;
  foreign_subtotal?: number | null;
  foreign_tax_amount?: number | null;
  foreign_total_amount?: number | null;
  received_date?: string | null;
  landed_costs?: PurchaseLandedCostDto[];
  notes?: string | null;
  supplier?: SupplierDto;
  lines?: PurchaseGrnLineDto[];
  created_at?: string;
};

export type PurchaseReturnLineDto = {
  id?: number;
  sku: string;
  quantity: number;
  unit_cost: number;
  line_total?: number;
};

export type PurchaseReturnDto = {
  id: number;
  uuid?: string;
  number: string;
  supplier_id: number;
  purchase_grn_id?: number | null;
  warehouse_id?: number | null;
  return_date?: string | null;
  total_amount: number;
  status: string;
  notes?: string | null;
  supplier?: SupplierDto;
  lines?: PurchaseReturnLineDto[];
  created_at?: string;
};

export type PurchaseActivityDto = {
  id: number;
  event_name?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  description: string;
  actor_id?: string | null;
  meta?: Record<string, unknown> | null;
  created_at?: string;
};

export type SupplierSuggestionDto = {
  product_id: number;
  sku: string;
  suggestions: {
    supplier_id: number;
    supplier_name?: string;
    is_preferred: boolean;
    lead_time_days?: number | null;
    last_unit_cost?: number | null;
    last_received_at?: string | null;
  }[];
};

export type CreatePurchaseReturnInput = {
  supplier_id: number;
  purchase_grn_id?: number;
  warehouse_id?: number;
  return_date?: string;
  notes?: string;
  lines: { sku: string; quantity: number; unit_cost: number }[];
};
