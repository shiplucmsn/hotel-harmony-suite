import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { api } from "@/services/api/client";
import type { ApiEnvelope } from "@/services/api/types";

function unwrap<T>(res: ApiEnvelope<T> | T): T {
  if (typeof res === "object" && res !== null && "data" in res) {
    return (res as ApiEnvelope<T>).data;
  }
  return res as T;
}

export function useApiQuery<T>(
  queryKey: readonly unknown[],
  path: string,
  options?: Omit<UseQueryOptions<T>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const res = await api.get<ApiEnvelope<T> | T>(path);
      return unwrap(res);
    },
    ...options,
  });
}
