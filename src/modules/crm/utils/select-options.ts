import type { SearchableSelectOption } from "@/shared/components/forms/searchable-select";
import type { CrmCustomerDto, CrmInvoiceDto, CrmOrderDto } from "@/modules/crm/types";
import { formatMoney } from "@/modules/crm/utils";
import type { ProductDto } from "@/modules/inventory/types";

export function customerSelectOptions(
  customers: CrmCustomerDto[],
  includeNone?: { label?: string },
): SearchableSelectOption[] {
  const items = customers.map((c) => ({
    value: String(c.id),
    label: c.name,
    keywords: [c.code, c.email, c.phone].filter(Boolean).join(" "),
  }));

  if (includeNone) {
    return [{ value: "none", label: includeNone.label ?? "No customer" }, ...items];
  }

  return items;
}

export function productSelectOptions(
  products: ProductDto[],
  includeCustom?: { label?: string },
): SearchableSelectOption[] {
  const items = products.map((p) => ({
    value: p.sku,
    label: `${p.sku} — ${p.name}`,
    keywords: [p.name, p.barcode].filter(Boolean).join(" "),
  }));

  if (includeCustom) {
    return [{ value: "none", label: includeCustom.label ?? "Custom line" }, ...items];
  }

  return items;
}

export function orderSelectOptions(
  orders: CrmOrderDto[],
  includeNone?: { label?: string },
): SearchableSelectOption[] {
  const items = orders.map((o) => ({
    value: String(o.id),
    label: `${o.number} · ${o.status} · ${formatMoney(o.total_amount)}`,
    keywords: o.customer ?? "",
  }));

  if (includeNone) {
    return [{ value: "none", label: includeNone.label ?? "— None —" }, ...items];
  }

  return items;
}

export function invoiceSelectOptions(invoices: CrmInvoiceDto[]): SearchableSelectOption[] {
  return invoices.map((i) => ({
    value: String(i.id),
    label: `${i.number} · ${i.customer} · due ${formatMoney(i.balance_due)}`,
    keywords: [i.customer, i.status].filter(Boolean).join(" "),
  }));
}

export function staticSelectOptions(
  items: { value: string; label: string }[],
): SearchableSelectOption[] {
  return items.map((i) => ({ value: i.value, label: i.label, keywords: i.label }));
}
