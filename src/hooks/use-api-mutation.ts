import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { api } from "@/services/api/client";
import { showSideEffects } from "@/lib/api-meta";
import type { ApiEnvelope } from "@/services/api/types";

type WriteMethod = "POST" | "PUT" | "PATCH" | "DELETE";

type MutationVars = {
  method: WriteMethod;
  path: string;
  body?: unknown;
};

export function useApiMutation<TData = unknown, TVariables = MutationVars>(
  options?: UseMutationOptions<TData, Error, TVariables> & { invalidateKeys?: readonly unknown[][] }
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: async (vars) => {
      const { method, path, body } = vars as MutationVars;
      const res =
        method === "POST"
          ? await api.post<ApiEnvelope<TData>>(path, body, { idempotent: true })
          : method === "PATCH"
            ? await api.patch<ApiEnvelope<TData>>(path, body, { idempotent: true })
            : method === "PUT"
              ? await api.put<ApiEnvelope<TData>>(path, body, { idempotent: true })
              : await api.delete<ApiEnvelope<TData>>(path, { idempotent: true });

      showSideEffects(res.meta);
      return (res.data ?? res) as TData;
    },
    onSuccess: async (data, variables, context) => {
      if (options?.invalidateKeys) {
        await Promise.all(options.invalidateKeys.map((key) => queryClient.invalidateQueries({ queryKey: key })));
      }
      await options?.onSuccess?.(data, variables, context);
    },
  });
}
