import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { financeApi } from "@/modules/finance/finance-api";
import { getApiErrorMessage } from "@/lib/api-errors";
import type { AccountFormValues } from "@/modules/finance/schemas";

const keys = {
  accounts: ["finance", "accounts"] as const,
};

export function useFinanceAccounts() {
  return useQuery({
    queryKey: keys.accounts,
    queryFn: () => financeApi.accounts(),
  });
}

export function useCreateFinanceAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: AccountFormValues) =>
      financeApi.createAccount({
        code: values.code,
        name: values.name,
        type: values.type,
        description: values.description,
        is_postable: values.is_postable,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.accounts });
      toast.success("Account created");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to create account")),
  });
}
