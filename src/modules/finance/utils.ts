import type { AccountType } from "@/modules/finance/types";

export function formatMoney(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatAccountType(type: AccountType): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function journalLineTotals(lines: { debit: number; credit: number }[]) {
  const debit = lines.reduce((s, l) => s + Number(l.debit || 0), 0);
  const credit = lines.reduce((s, l) => s + Number(l.credit || 0), 0);
  return { debit, credit, balanced: Math.round(debit * 100) === Math.round(credit * 100) };
}

export function paginateClient<T>(items: T[], page: number, perPage: number) {
  const total = items.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage) || 1);
  const safePage = Math.min(Math.max(1, page), lastPage);
  const data = items.slice((safePage - 1) * perPage, safePage * perPage);
  return {
    data,
    pagination: { page: safePage, perPage, total, lastPage },
  };
}
