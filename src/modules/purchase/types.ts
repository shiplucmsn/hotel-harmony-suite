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
  notes?: string | null;
  lines?: PurchaseOrderLineDto[];
  created_at?: string;
};

export type CreatePurchaseOrderInput = {
  supplier_id?: number;
  supplier?: string;
  warehouse_id?: number;
  order_date?: string;
  expected_date?: string;
  tax_amount?: number;
  notes?: string;
  status?: "draft" | "pending";
  lines?: { sku: string; quantity: number; unit_cost: number; description?: string }[];
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
  amount: number;
  payment_date?: string;
  method?: string;
  reference?: string;
  notes?: string;
};

export type PurchaseGrnLineDto = {
  id?: number;
  sku: string;
  quantity: number;
  unit_cost: number;
  line_total?: number;
};

export type PurchaseGrnDto = {
  id: number;
  uuid?: string;
  number: string;
  purchase_order_id?: number | null;
  supplier_id?: number | null;
  warehouse_id?: number | null;
  status: string;
  sku?: string;
  quantity?: number;
  unit_cost?: number;
  total_amount: number;
  received_date?: string | null;
  notes?: string | null;
  supplier?: SupplierDto;
  lines?: PurchaseGrnLineDto[];
  created_at?: string;
};

export type CreateGrnInput = {
  purchase_order_id?: number;
  supplier_id?: number;
  warehouse_id?: number;
  received_date?: string;
  notes?: string;
  sku?: string;
  quantity?: number;
  unit_cost?: number;
  lines?: { sku: string; quantity: number; unit_cost: number }[];
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

export type CreatePurchaseReturnInput = {
  supplier_id: number;
  purchase_grn_id?: number;
  warehouse_id?: number;
  return_date?: string;
  notes?: string;
  lines: { sku: string; quantity: number; unit_cost: number }[];
};
