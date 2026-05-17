import { useQuery } from "@tanstack/react-query";
import { financeApi } from "@/modules/finance/finance-api";

const keys = {
  ledger: (page: number, perPage: number, accountCode?: string) =>
    ["finance", "ledger", page, perPage, accountCode ?? "all"] as const,
};

export function useLedgerEntries(page = 1, perPage = 20, accountCode?: string) {
  return useQuery({
    queryKey: keys.ledger(page, perPage, accountCode),
    queryFn: () =>
      financeApi.ledger({
        page,
        per_page: perPage,
        account_code: accountCode && accountCode !== "all" ? accountCode : undefined,
      }),
  });
}
