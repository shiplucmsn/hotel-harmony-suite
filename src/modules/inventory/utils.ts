import type { InventoryCategoryDto, ProductDto, ProductStatus } from "@/modules/inventory/types";

export type CategoryTreeNode = InventoryCategoryDto & {
  children: InventoryCategoryDto[];
  productCount: number;
};

export function buildCategoryTree(
  categories: InventoryCategoryDto[],
  productCountByCategoryId: Record<number, number> = {},
): CategoryTreeNode[] {
  const childrenByParent = new Map<number, InventoryCategoryDto[]>();

  for (const category of categories) {
    if (category.parent_id) {
      const siblings = childrenByParent.get(category.parent_id) ?? [];
      siblings.push(category);
      childrenByParent.set(category.parent_id, siblings);
    }
  }

  const roots = categories.filter((c) => !c.parent_id);

  return roots.map((root) => {
    const children = childrenByParent.get(root.id) ?? [];
    const childCount = children.reduce((sum, c) => sum + (productCountByCategoryId[c.id] ?? 0), 0);
    return {
      ...root,
      children,
      productCount: (productCountByCategoryId[root.id] ?? 0) + childCount,
    };
  });
}

export function formatMoney(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function movementTypeLabel(type: string): string {
  const map: Record<string, string> = {
    in: "Receipt",
    out: "Issue",
    adjustment: "Adjustment",
    transfer: "Transfer",
    purchase_receipt: "Purchase",
    sales_issue: "Sale",
    transfer_in: "Transfer In",
    transfer_out: "Transfer Out",
  };
  return map[type] ?? type.replace(/_/g, " ");
}

export function productDisplayStatus(
  stock: number,
  status: string,
  reorderLevel = 10,
): "active" | "inactive" | "low-stock" | "out-of-stock" {
  if (status === "inactive" || status === "discontinued") return "inactive";
  if (stock <= 0) return "out-of-stock";
  if (stock <= reorderLevel) return "low-stock";
  return "active";
}

export function countProductsByCategory(products: ProductDto[]): Record<number, number> {
  const counts: Record<number, number> = {};
  for (const product of products) {
    const id = product.category_id ?? product.category_ref?.id;
    if (id) {
      counts[id] = (counts[id] ?? 0) + 1;
    }
  }
  return counts;
}

export type StockDisplayStatus = "in-stock" | "low-stock" | "out-of-stock";

export function stockDisplayStatus(stock: number, reorderLevel = 10): StockDisplayStatus {
  if (stock <= 0) return "out-of-stock";
  if (stock <= reorderLevel) return "low-stock";
  return "in-stock";
}

/** Map UI stock badge to API product status. */
export function apiStatusFromDisplay(display: StockDisplayStatus): ProductStatus {
  if (display === "out-of-stock") return "inactive";
  return "active";
}

export function primaryWarehouseName(product: ProductDto): string {
  const level = product.stock_levels?.[0];
  if (level?.warehouse?.name) return level.warehouse.name;
  return "Main Warehouse";
}

const transferStatusTone: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  in_transit: "bg-info/10 text-info",
  completed: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

export function transferStatusClass(status: string): string {
  return transferStatusTone[status] ?? "bg-muted text-muted-foreground";
}

export function formatTransferStatus(status: string): string {
  return status.replace(/_/g, " ");
}

export function mapProductToRow(product: ProductDto, reorderLevel = 10) {
  const stock = Number(product.stock ?? 0);
  const cost = Number(product.cost_price ?? 0);
  const price = Number(product.price ?? 0);
  return {
    id: String(product.id),
    sku: product.sku,
    name: product.name,
    categoryId: String(product.category_id ?? product.category_ref?.id ?? ""),
    category: product.category_ref?.name ?? product.category ?? "Uncategorized",
    brand: product.brand ?? "N/A",
    warehouse: primaryWarehouseName(product),
    stock,
    reorderLevel,
    unitCost: cost > 0 ? cost : Math.round(price * 0.7),
    sellingPrice: price,
    status: stockDisplayStatus(stock, reorderLevel),
    apiStatus: (product.status as ProductStatus) || "active",
  };
}
