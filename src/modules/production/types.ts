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

export type ProductionMutationMeta = {
  sideEffects?: ApiMetaSideEffect[];
};

