export type ProductStatus = "active" | "inactive" | "discontinued";

export type InventoryCategoryDto = {
  id: number;
  uuid?: string;
  parent_id?: number | null;
  code: string;
  name: string;
  description?: string | null;
  is_active: boolean;
};

export type CreateCategoryInput = {
  code: string;
  name: string;
  description?: string;
  parent_id?: number;
  is_active?: boolean;
};

/** Lightweight SKU registry row (products table). */
export type SkuDto = {
  id: number;
  product_id: number;
  sku: string;
  name: string;
  barcode?: string | null;
  category?: string | null;
  category_id?: number | null;
  warehouse?: string | null;
  default_warehouse_id?: number | null;
  stock: number;
  price: number;
  cost_price?: number;
  status: string;
};

export type GenerateSkuInput = {
  category_prefix: string;
  subcategory_prefix?: string;
  sequence_padding?: number;
};

export type GenerateSkuResult = {
  sku: string;
  pattern: string;
  sequence: number;
};

export type ProductDto = {
  id: number;
  uuid?: string;
  sku: string;
  barcode?: string | null;
  name: string;
  description?: string | null;
  category_id?: number | null;
  unit_id?: number | null;
  category?: string | null;
  brand?: string | null;
  price: number;
  cost_price?: number;
  track_inventory?: boolean;
  default_warehouse_id?: number | null;
  stock: number;
  status: ProductStatus | string;
  category_ref?: { id: number; code: string; name: string } | null;
  unit?: { id: number; code: string; name: string; symbol?: string | null } | null;
  stock_levels?: StockLevelDto[];
};

export type StockLevelDto = {
  id: number;
  product_id: number;
  warehouse_id: number;
  qty_on_hand: number;
  qty_reserved: number;
  available_qty: number;
  warehouse?: { id: number; code: string; name: string };
};

export type WarehouseDto = {
  id: number;
  uuid?: string;
  code: string;
  name: string;
  location?: string | null;
  status: string;
  is_default: boolean;
};

export type PaginatedResult<T> = {
  data: T[];
  pagination?: {
    page: number;
    perPage: number;
    total: number;
    lastPage: number;
  };
};

export type CreateProductInput = {
  sku?: string;
  name: string;
  barcode?: string;
  description?: string;
  category?: string;
  category_id?: number;
  brand?: string;
  price?: number;
  cost_price?: number;
  opening_qty?: number;
  default_warehouse_id?: number;
  status?: ProductStatus;
};

export type UpdateProductInput = Partial<CreateProductInput>;

export type StockMovementDto = {
  id: number;
  sku: string;
  product_id?: number | null;
  warehouse_id?: number | null;
  movement_type: string;
  quantity: number;
  quantity_delta: number;
  qty_before: number;
  qty_after: number;
  unit_cost: number;
  reference_type?: string | null;
  reference_id?: string | null;
  correlation_id?: string | null;
  notes?: string | null;
  created_at?: string | null;
};

export type CreateWarehouseInput = {
  code: string;
  name: string;
  location?: string;
  status?: string;
  is_default?: boolean;
};

export type AdjustStockInput = {
  sku?: string;
  product_id?: number;
  warehouse_id?: number;
  quantity: number;
  unit_cost?: number;
  notes?: string;
  reference_type?: string;
  reference_id?: string;
};

export type MovementListParams = {
  page?: number;
  per_page?: number;
  sku?: string;
  product_id?: number;
  warehouse_id?: number;
  movement_type?: string;
};

export type StockLevelListParams = {
  page?: number;
  per_page?: number;
  sku?: string;
  product_id?: number;
  warehouse_id?: number;
};
