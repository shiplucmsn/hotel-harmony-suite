import { useCallback, useEffect, useState } from "react";
import { api, ApiError, type ApiRequestOptions } from "@/lib/api-client";
import { showSideEffects, type ApiEnvelope } from "@/lib/api-meta";

type QueryState<T> = {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
  refetch: () => Promise<void>;
};

export function useApiQuery<T>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">): QueryState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiEnvelope<T> | T>(path, options);
      const payload = typeof res === "object" && res !== null && "data" in res ? (res as ApiEnvelope<T>).data : (res as T);
      setData(payload);
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError("Request failed", 500, err));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [path, options]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, error, loading, refetch };
}

type MutationState = {
  loading: boolean;
  error: ApiError | null;
};

export function useApiMutation<TBody = unknown, TResult = unknown>() {
  const [state, setState] = useState<MutationState>({ loading: false, error: null });

  const mutate = useCallback(
    async (
      method: "POST" | "PUT" | "PATCH" | "DELETE",
      path: string,
      body?: TBody,
      options?: Omit<ApiRequestOptions, "method" | "body">
    ): Promise<TResult | null> => {
      setState({ loading: true, error: null });
      try {
        const request =
          method === "POST"
            ? api.post<ApiEnvelope<TResult>>(path, body, options)
            : method === "PATCH"
              ? api.patch<ApiEnvelope<TResult>>(path, body, options)
              : method === "PUT"
                ? api.put<ApiEnvelope<TResult>>(path, body, options)
                : api.delete<ApiEnvelope<TResult>>(path, options);

        const res = await request;
        showSideEffects(res.meta);
        return res.data ?? (res as unknown as TResult);
      } catch (err) {
        const apiErr = err instanceof ApiError ? err : new ApiError("Request failed", 500, err);
        setState({ loading: false, error: apiErr });
        throw apiErr;
      } finally {
        setState((prev) => ({ ...prev, loading: false }));
      }
    },
    []
  );

  return { ...state, mutate };
}
