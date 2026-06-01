import type { ApiMetaSideEffect } from "@/services/api/types";

export type PaginatedResult<T> = {
  data: T[];
  pagination?: {
    page: number;
    perPage: number;
    total: number;
    lastPage: number;
  };
};

export type ProductionRawMaterialDto = {
  id: number;
  product_id: number;
  sku: string;
  name: string;
  uom: string;
  stock: number;
  reorder_point: number;
  cost_price: number;
  status: "ok" | "low" | "out_of_stock" | string;
  product_status?: string;
  preferred_supplier_id?: number | null;
  preferred_supplier_name?: string | null;
  in_bom: boolean;
  bom_usage_count: number;
  fill_percent: number;
};

export type ProductionFinishedGoodsDto = {
  id: number;
  product_id: number;
  sku: string;
  name: string;
  uom: string;
  stock: number;
  reorder_point: number;
  cost_price: number;
  price: number;
  status: "ok" | "low" | "out_of_stock" | string;
  product_status?: string;
  bom_output_count: number;
  bom_codes: string[];
  preferred_supplier_id?: number | null;
  preferred_supplier_name?: string | null;
  fill_percent: number;
};

export type RegisterProductionRawMaterialInput = {
  product_id?: number;
  sku?: string;
  name?: string;
  cost_price?: number;
  reorder_point?: number;
  supplier_id?: number;
  opening_qty?: number;
};

export type MaterialAvailabilityLineDto = {
  sku: string;
  qty_per_batch?: number;
  on_hand: number;
  available_qty: number;
  sufficient_for_one_batch?: boolean;
  product_name?: string;
};

export type ProductionBomLineDto = {
  id: number;
  sku: string;
  product_id: number | null;
  product_name?: string | null;
  qty_per_batch: number;
  wastage_pct: number;
  unit_cost: number;
  notes?: string | null;
};

export type ProductionBomDto = {
  id: number;
  uuid: string;
  code?: string | null;
  name: string;
  sku?: string | null;
  product_id?: number | null;
  product_name?: string | null;
  batch_size: number;
  status: string;
  notes?: string | null;
  lines: ProductionBomLineDto[];
  created_at?: string;
  updated_at?: string;
};

export type ProductionMaterialReadinessDto = {
  sku: string;
  product_name?: string | null;
  planned_qty: number;
  on_hand: number;
  available_qty: number;
  shortfall: number;
  sufficient: boolean;
  unit_cost: number;
  planned_cost: number;
  warehouse_id?: number | null;
};

export type ProductionWorkOrderMaterialDto = {
  id: number;
  sku: string;
  product_id: number | null;
  product_name?: string | null;
  planned_qty: number;
  actual_qty: number;
  unit_cost: number;
  line_cost: number;
};

export type ProductionWorkOrderOutputDto = {
  id: number;
  sku: string;
  product_id: number | null;
  product_name?: string | null;
  planned_qty: number;
  actual_qty: number;
  unit_cost: number;
  line_cost: number;
};

export type ProductionWorkOrderJournalDto = {
  id: number;
  entry_number: string;
  entry_date: string;
  reference_type?: string | null;
  reference_id?: string | null;
  memo?: string | null;
  status: string;
  lines?: { id: number; account_code: string; debit: number; credit: number }[];
};

export type ProductionWorkOrderDto = {
  id: number;
  uuid: string;
  number: string;
  status: string;
  bom_id: number | null;
  bom_name?: string | null;
  warehouse_id?: number | null;
  planned_qty: number;
  actual_qty: number;
  raw_material_cost: number;
  overhead_cost: number;
  total_cost: number;
  journal_entry_id?: number | null;
  journal_entry?: ProductionWorkOrderJournalDto | null;
  estimated_material_cost?: number;
  estimated_output_qty?: number;
  material_readiness?: ProductionMaterialReadinessDto[];
  scheduled_date?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  notes?: string | null;
  materials: ProductionWorkOrderMaterialDto[];
  outputs: ProductionWorkOrderOutputDto[];
  created_at?: string;
  updated_at?: string;
};

export type CreateProductionBomInput = {
  code?: string;
  name: string;
  sku?: string;
  batch_size?: number;
  status?: "active" | "inactive";
  notes?: string;
  lines: {
    sku?: string;
    product_id?: number;
    qty_per_batch: number;
    wastage_pct?: number;
    unit_cost?: number;
    notes?: string;
  }[];
};

export type UpdateProductionBomInput = Partial<CreateProductionBomInput>;

export type CreateProductionWorkOrderInput = {
  bom_id: number;
  number?: string;
  planned_qty: number;
  warehouse_id?: number;
  scheduled_date?: string;
  status?: "draft" | "released";
  notes?: string;
  idempotency_key?: string;
};

export type CompleteProductionWorkOrderInput = {
  warehouse_id?: number;
  overhead_cost?: number;
  consumed_materials?: {
    line_id: number;
    actual_qty: number;
    unit_cost?: number;
  }[];
  produced_goods?: {
    line_id: number;
    actual_qty: number;
    unit_cost?: number;
  }[];
};

export type ProductionPlanningWorkOrderCardDto = {
  id: number;
  number: string;
  status: string;
  bom_id: number | null;
  bom_name?: string | null;
  planned_qty: number;
  actual_qty: number;
  scheduled_date?: string | null;
  warehouse_id?: number | null;
  warehouse_name?: string | null;
};

export type ProductionPlanningDayDto = {
  date: string;
  label: string;
  work_orders: ProductionPlanningWorkOrderCardDto[];
};

export type ProductionPlanningTrendDto = {
  date: string;
  label: string;
  planned: number;
  actual: number;
};

export type ProductionPlanningCapacityDto = {
  warehouse_id: number | null;
  name: string;
  planned_qty: number;
  load_percent: number;
  work_order_count: number;
};

export type ProductionPlanningDashboardDto = {
  week_start: string;
  week_end: string;
  summary: {
    scheduled: number;
    in_progress: number;
    draft: number;
    backlog: number;
    completed_week: number;
    on_time_rate: number;
  };
  trend: ProductionPlanningTrendDto[];
  schedule: ProductionPlanningDayDto[];
  capacity: ProductionPlanningCapacityDto[];
};

export type ProductionMutationMeta = {
  sideEffects?: ApiMetaSideEffect[];
};

