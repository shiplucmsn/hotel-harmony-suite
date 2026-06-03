import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { financeApi } from "@/modules/finance/finance-api";
import { getApiErrorMessage } from "@/lib/api-errors";
import { matchesTenantQueryKey, withTenantKey } from "@/lib/tenant-query";
import type { JournalFormValues } from "@/modules/finance/schemas";

const keys = {
  journal: (page: number, perPage: number) => withTenantKey(["finance", "journal", page, perPage] as const),
};

export function useJournalEntries(page = 1, perPage = 15) {
  return useQuery({
    queryKey: keys.journal(page, perPage),
    queryFn: () => financeApi.journal({ page, per_page: perPage }),
  });
}

export function usePostJournalEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: JournalFormValues) =>
      financeApi.postJournal({
        entry_date: values.entry_date,
        reference_type: values.reference_type,
        reference_id: values.reference_id,
        memo: values.memo,
        lines: values.lines.map((l) => ({
          account_code: l.account_code,
          debit: l.debit || 0,
          credit: l.credit || 0,
        })),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ predicate: matchesTenantQueryKey(["finance", "journal"]) });
      qc.invalidateQueries({ predicate: matchesTenantQueryKey(["finance", "ledger"]) });
      qc.invalidateQueries({ predicate: matchesTenantQueryKey(["finance", "accounts"]) });
      toast.success("Journal entry posted");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to post journal entry")),
  });
}
